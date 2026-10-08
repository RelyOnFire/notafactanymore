"""Check published page layouts and links into folded institutional evidence."""
import argparse
import asyncio
import functools
import http.server
import json
import pathlib
import threading
from urllib.parse import parse_qs, quote, urlparse
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--base-url')
parser.add_argument('--executable')
parser.add_argument('--screenshots', type=pathlib.Path)
parser.add_argument('--paths', nargs='+', help='Check only these paths; omit for the full reading check.')
parser.add_argument('--widths', nargs='+', type=int, default=[320, 390, 1440])
parser.add_argument('--contributions', action='store_true', help='Check contribution flows when --paths limits layout checks.')
args = parser.parse_args()


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


async def check_layout(page, label='Page'):
    sizes = await page.evaluate('({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})')
    if sizes['scroll'] > sizes['client'] + 1:
        offenders = await page.evaluate('''() => [...document.querySelectorAll('body *')].filter(el => {
            if (!el.textContent.trim() || el.children.length || !el.getBoundingClientRect().width) return false;
            for (let p = el.parentElement; p; p = p.parentElement) if (getComputedStyle(p).overflowX !== 'visible') return false;
            const range = document.createRange(); range.selectNodeContents(el);
            return range.getBoundingClientRect().right > document.documentElement.clientWidth + 1;
        }).slice(0,8).map(el => ({tag:el.tagName,class:el.className,text:el.textContent.trim().slice(0,160)}))''')
        boxes = await page.evaluate('''() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(0,12).map(el => ({tag:el.tagName,class:el.className,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right}))''')
        raise AssertionError(f'{label} horizontal overflow: {sizes}; text: {offenders}; boxes: {boxes}')


async def check_corrections(browser, base):
    context = await browser.new_context(viewport={'width': 390, 'height': 844})
    drafts = []

    async def intercept_draft(route):
        # Validate the draft URL without sending a request or submitting an issue to GitHub.
        drafts.append(parse_qs(urlparse(route.request.url).query))
        await route.fulfill(status=200, content_type='text/html', body='<title>Draft intercepted</title>')

    await context.route('https://github.com/**/issues/new*', intercept_draft)
    page = await context.new_page()
    details = 'Missing context: Österreich & “quotation”.\nThe second line should survive.'
    evidence = 'Source: https://example.org/paper?language=de&section=2\nPage 12, paragraph 3.'
    summary = 'Source note needs context'
    paths = ['/institutions/lysenkoist-heredity/', '/de/institutions/lysenkoist-heredity/', '/entries/peptic-ulcers/', '/de/entries/peptic-ulcers/']
    for path in paths:
        fragment = '#ussr-1948-1964' if '/institutions/' in path else ''
        await page.goto(base + path + fragment, wait_until='networkidle')
        await page.locator('main .correction-link').first.click()
        await page.wait_for_url('**/corrections/**')
        await page.locator('#correction-form').wait_for(state='visible')
        expected_page = 'https://notafactanymore.com' + path + fragment
        assert await page.locator('[name="page"]').input_value() == expected_page, 'Case or citation context was lost'
        await page.locator('[name="summary"]').fill(summary)
        await page.locator('[name="kind"]').select_option('source')
        await page.locator('[name="details"]').fill(details)
        await page.locator('[name="evidence"]').fill(evidence)
        await page.locator('[name="suggestion"]').fill('Narrow the wording to the source’s scope.')
        async with page.expect_navigation(wait_until='domcontentloaded'):
            await page.locator('#correction-form button[type="submit"]').click()
        draft = drafts[-1]
        assert draft['template'] == ['correction.md']
        assert draft['title'] == ['[Correction] ' + summary]
        assert expected_page in draft['body'][0] and details in draft['body'][0] and evidence in draft['body'][0]
        assert 'labels' not in draft, 'The public draft requires label permissions'

    for prefix in ['', '/de']:
        await page.goto(base + prefix + '/corrections/', wait_until='networkidle')
        await page.locator('#copy-correction').click()
        assert await page.locator('[name="page"]').input_value() == '', 'An empty page silently became the homepage'
        assert not await page.locator('#correction-draft').is_visible()
        await page.locator('[name="page"]').fill('https://example.org/another-site/')
        await page.locator('[name="summary"]').fill(summary)
        await page.locator('[name="details"]').fill(details)
        await page.locator('#copy-correction').click()
        assert not await page.locator('#correction-draft').is_visible(), 'An unrelated page was accepted'
        await page.locator('[name="page"]').fill('http://www.notafactanymore.com/institutions/lysenkoist-heredity/#ussr-1948-1964')
        long_details = 'A detailed correction with precise quotations and context.\n' * 200
        await page.locator('[name="details"]').fill(long_details)
        before = len(drafts)
        await page.locator('#correction-form button[type="submit"]').click()
        assert len(drafts) == before and await page.locator('#correction-draft').is_visible(), 'Long report was sent through an oversized URL'
        assert long_details.strip() in await page.locator('#correction-report').input_value(), 'Long report was truncated'
        assert await page.locator('[name="page"]').input_value() == 'https://notafactanymore.com/institutions/lysenkoist-heredity/#ussr-1948-1964'
        await page.locator('#copy-correction').click()
        await check_layout(page, 'Long correction draft')
        await page.goto(base + prefix + '/corrections/?page=' + quote('javascript:alert(1)', safe=''), wait_until='networkidle')
        assert await page.locator('[name="page"]').input_value() == '', 'Unsafe incoming page was accepted'

        await page.goto(base + prefix + '/submit/', wait_until='networkidle')
        for name, value in {'oldClaim': 'Earlier claim & its scope', 'current': 'The better-supported understanding', 'why': 'A new measurement', 'oldEvidence': evidence, 'newEvidence': evidence}.items():
            await page.locator(f'[name="{name}"]').fill(value)
        await page.locator('[name="category"]').select_option('__other__')
        await page.locator('[name="categoryOther"]').fill('History & technology')
        async with page.expect_navigation(wait_until='domcontentloaded'):
            await page.locator('#submission-form button[type="submit"]').click()
        assert drafts[-1]['template'] == ['submission.md'] and 'labels' not in drafts[-1]
        assert 'History & technology' in drafts[-1]['body'][0] and evidence in drafts[-1]['body'][0]
        await page.goto(base + prefix + '/submit/', wait_until='networkidle')
        for name, value in {'oldClaim': 'Earlier claim', 'current': 'A better understanding', 'why': 'New evidence', 'oldEvidence': long_details, 'newEvidence': evidence}.items():
            await page.locator(f'[name="{name}"]').fill(value)
        first_category = await page.locator('[name="category"] option').nth(1).get_attribute('value')
        await page.locator('[name="category"]').select_option(first_category)
        before = len(drafts)
        await page.locator('#submission-form button[type="submit"]').click()
        assert len(drafts) == before and await page.locator('.submission-draft').is_visible()
        assert long_details.strip() in await page.locator('#submission-report').input_value(), 'Long submission was truncated'
    await context.close()
    return len(drafts)


async def main():
    server = None
    if args.base_url:
        base = args.base_url.rstrip('/')
    else:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT / 'dist')))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f'http://127.0.0.1:{server.server_port}'
    issues = []
    checked = 0
    draft_checks = 0
    async with async_playwright() as p:
        options = {'headless': True}
        if args.executable:
            options['executable_path'] = args.executable
        browser = await p.chromium.launch(**options)
        paths = ['/', '/browse/', '/timeline/', '/institutions/', '/lifespans/', '/glossary/', '/categories/medicine/', '/methodology/', '/about/', '/submit/', '/corrections/',
                 '/entries/peptic-ulcers/', '/institutions/lysenkoist-heredity/', '/institutions/virginity-testing/', '/institutions/routine-oxygen-heart-attack/']
        paths += [('/de/' if path == '/' else '/de' + path) for path in paths]
        if args.paths:
            paths = args.paths
        for width in args.widths:
            ctx = await browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=width < 700, has_touch=width < 700)
            semaphore = asyncio.Semaphore(3)

            async def inspect(path):
                nonlocal checked
                async with semaphore:
                    page = await ctx.new_page()
                    page.on('pageerror', lambda error: issues.append(f'{width}px {path}: {error}'))
                    try:
                        response = await page.goto(base + path, wait_until='networkidle')
                        assert response.status == 200, f'HTTP {response.status}'
                        await check_layout(page)
                        if path.endswith('/institutions/'):
                            for view in ['cards', 'compact']:
                                await page.locator(f'.view-button[data-view="{view}"]').click()
                                await check_layout(page, view)
                            await page.locator('.institutional-search').fill('Lyssenko' if path.startswith('/de/') else 'Lysenko')
                            assert await page.locator('.belief-group:visible').count() == 1, 'Search did not find one belief'
                            await page.locator('.filter-toggle').click()
                            assert await page.locator('.filter-panel').is_visible()
                            await page.keyboard.press('Escape')
                            assert not await page.locator('.filter-panel').is_visible()
                        if args.screenshots and width in [390, 1440] and path in ['/', '/institutions/lysenkoist-heredity/', '/methodology/', '/de/methodology/', '/corrections/', '/de/corrections/']:
                            args.screenshots.mkdir(parents=True, exist_ok=True)
                            await page.screenshot(path=str(args.screenshots / f'{width}-{path.strip("/").replace("/", "-") or "home"}.png'))
                        checked += 1
                    except Exception as error:
                        issues.append(f'{width}px {path}: {error}')
                    finally:
                        await page.close()

            await asyncio.gather(*(inspect(path) for path in paths))
            if width == 390 and not args.paths:
                # The shared presentation must work for every case, including long German copy.
                corpus = [f'/institutions/{file.stem}/' for file in sorted((ROOT / 'src/data/institutional-beliefs').glob('*.yaml'))]
                corpus += ['/de' + path for path in corpus]
                await asyncio.gather(*(inspect(path) for path in corpus if path not in paths))
                page = await ctx.new_page()
                for path in ['/institutions/lysenkoist-heredity/', '/de/institutions/lysenkoist-heredity/']:
                    try:
                        await page.goto(base + path, wait_until='networkidle')
                        assert await page.locator('.evidence-item').count() == 42
                        assert await page.locator('.source-registry li').count() == 15
                        assert await page.locator('.evidence-disclosure[open]').count() == 0
                        await page.locator('.evidence-toggle').click()
                        assert await page.locator('.evidence-item:visible').count() == 42
                        await page.locator('.evidence-toggle').click()
                        assert await page.locator('.evidence-disclosure[open]').count() == 0
                        evidence_id = await page.locator('.evidence-item').first.get_attribute('id')
                        await page.goto(base + path + '#' + evidence_id, wait_until='networkidle')
                        await page.wait_for_function('(id) => document.getElementById(id).closest("details").open', arg=evidence_id)
                        assert await page.locator('#' + evidence_id).is_visible()
                        await page.locator('.case-navigation a[href="#source-registry"]').click()
                        await page.wait_for_function('document.querySelector(".source-registry").open')
                        assert await page.locator('.source-registry li').first.is_visible()
                        await page.locator('.case-navigation a[href="#ussr-1948-1964"]').click()
                        await page.wait_for_timeout(100)
                        y = await page.locator('#ussr-1948-1964').evaluate('(el) => el.getBoundingClientRect().top')
                        assert abs(y) < 50, f'Episode jump did not land on the episode: {y}'
                        print_state = await page.locator('.institution-case details').evaluate_all('(sections) => sections.map(section => section.open)')
                        await page.evaluate('window.dispatchEvent(new Event("beforeprint"))')
                        assert await page.locator('.institution-case details:not([open])').count() == 0, 'Printed evidence remained folded'
                        await page.evaluate('window.dispatchEvent(new Event("afterprint"))')
                        assert await page.locator('.institution-case details').evaluate_all('(sections) => sections.map(section => section.open)') == print_state, 'Printing changed the reading state'
                    except Exception as error:
                        issues.append(f'Evidence navigation {path}: {error}')
                await page.close()
            await ctx.close()
        if not args.paths or args.contributions:
            draft_checks = await check_corrections(browser, base)
            # Evidence can still be expanded when JavaScript is unavailable.
            ctx = await browser.new_context(java_script_enabled=False)
            page = await ctx.new_page()
            await page.goto(base + '/institutions/lysenkoist-heredity/')
            await page.locator('.evidence-disclosure summary').first.click()
            assert await page.locator('.evidence-item').first.is_visible()
            for prefix in ['', '/de']:
                await page.goto(base + prefix + '/corrections/')
                assert await page.locator('noscript a').is_visible(), 'Correction fallback needs JavaScript'
                assert 'template=correction.md' in await page.locator('noscript a').get_attribute('href')
                assert not await page.locator('#correction-form').is_visible()
                await page.goto(base + prefix + '/submit/')
                assert await page.locator('noscript a').is_visible(), 'Submission fallback needs JavaScript'
                assert 'template=submission.md' in await page.locator('noscript a').get_attribute('href')
                assert not await page.locator('#submission-form').is_visible()
            await ctx.close()
        await browser.close()
    if server:
        server.shutdown()
        server.server_close()
    if issues:
        raise AssertionError('\n'.join(issues))
    print(json.dumps({'pageChecks': checked, 'widths': args.widths, 'fullReadingCheck': not args.paths, 'issueDraftsChecked': draft_checks}), flush=True)


asyncio.run(main())
