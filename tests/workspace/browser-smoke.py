import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

artifacts = Path(os.environ['WORKSPACE_TEST_ARTIFACTS'])
actors = json.loads((artifacts / 'browser-sessions.json').read_text())
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
    context = browser.new_context(viewport={'width':1440,'height':1000})
    context.add_cookies([{'name':'bdc.session-token.v2','value':actors[0]['cookie'],'domain':'localhost','path':'/','httpOnly':True,'sameSite':'Lax'}])
    page = context.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto('http://localhost:3100/workspace',wait_until='networkidle',timeout=120000)
    page.wait_for_timeout(6000)
    page.screenshot(path=str(artifacts/'workspace-first.png'),full_page=True)
    print(page.locator('body').inner_text()[:7000])
    print('Page errors:',errors)
    browser.close()
