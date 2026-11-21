"""Exercise the owned local Workspace against its isolated real API and WebSocket."""
import json, os, re, sys, time, struct, zlib
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
sys.stdout.reconfigure(encoding='utf-8')
artifacts=Path(os.environ['WORKSPACE_TEST_ARTIFACTS'])
actors=json.loads((artifacts/'browser-sessions.json').read_text())
base='http://localhost:3100'
def png(width=800,height=400):
    def chunk(kind,data): return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
    rows=b''.join(b'\0'+bytes([60+y%100,100,200])*width for y in range(height))
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',width,height,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(rows))+chunk(b'IEND',b'')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') or (r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' if os.name=='nt' else None))
    production=os.environ.get('WORKSPACE_TEST_PRODUCTION')=='1'
    cookie_name='__Secure-bdc.session-token.v2' if production else 'bdc.session-token.v2'
    context=browser.new_context(viewport={'width':1440,'height':1000},extra_http_headers={'Cookie':cookie_name+'='+actors[0]['cookie']} if production else {})
    context.add_cookies([{'name':cookie_name,'value':actors[0]['cookie'],'domain':'localhost','path':'/','httpOnly':True,'sameSite':'Lax','secure':production}])
    context.route('**/api/ai/agents/notifications',lambda route:route.fulfill(json={'notifications':[],'unread_count':0}))
    context.route('**/lmsapiv1/me/roles',lambda route:route.fulfill(json={'roles':['STUDENT']}))
    context.route('**/apiv1/api/users/*',lambda route:route.fulfill(json={'id':901,'name':'Alice','role':'ROLE_MEMBER'}))
    page=context.new_page(); errors=[]
    def client_error(error):
        errors.append(error.message);print('CLIENT ERROR',error.message,flush=True)
    page.on('pageerror',client_error)
    expect.set_options(timeout=45000)
    def api(path,method='GET',data=None,headers=None):
        try: response=context.request.fetch(base+'/api/workspace'+path,method=method,data=data,headers={'Origin':base,**(headers or {})})
        except Exception: raise RuntimeError('Local test API unavailable: '+path) from None
        assert response.ok,(path,response.status,response.text())
        return response.json()
    api('/bootstrap')
    space=api('/spaces','POST',{'title':'Ảnh và mục lục '+str(int(time.time()))})
    source=api('/spaces/'+space['id']+'/pages','POST',{'title':'Nguồn ảnh'})
    image=api('/pages/'+source['id']+'/files','POST',png(),{'Content-Type':'application/octet-stream','X-File-Name':'sample.png'})
    markdown='# Tổng quan\n\nDòng đầu tiên\n\n## Phần chi tiết\n\nVăn bản ở giữa\n\n### Mục nhỏ\n\n![Ảnh kiểm tra]('+image['url']+')\n\nDòng cuối cùng\n\n# Kết luận\n\n'+('\n\n'.join('Nội dung dài kiểm tra cuộn '+str(i) for i in range(18)))
    note=api('/spaces/'+space['id']+'/pages','POST',{'title':'Sổ kiểm tra media','markdown':markdown})
    child=api('/spaces/'+space['id']+'/pages','POST',{'title':'Trang con có sẵn','parent_id':note['id']})
    url=base+'/workspace?page='+note['id']
    page.goto(url,wait_until='networkidle',timeout=120000)
    editor=page.locator('.bn-editor[contenteditable=true]');expect(editor).to_be_visible(timeout=120000)
    page.evaluate("localStorage.setItem('bdc-theme','light')"); page.reload(wait_until='networkidle')
    expect(editor).to_be_visible()
    expect(page.get_by_role('button',name='Tạo trang con',exact=True)).to_have_count(0)
    expect(editor.locator('[data-content-type=image]')).to_have_count(1)
    page.screenshot(path=str(artifacts/'media-initial.png'),full_page=True)
    def order(): return editor.locator('.bn-block-outer[data-id]').evaluate_all("els=>els.map(el=>({id:el.dataset.id,type:el.querySelector('[data-content-type]')?.dataset.contentType,text:el.innerText}))")
    def drag(source,target,after=False):
        source.scroll_into_view_if_needed();target.scroll_into_view_if_needed()
        start=source.bounding_box();box=target.bounding_box()
        x=box['x']+min(100,box['width']/2);y=box['y']+(box['height']-2 if after else 2)
        page.mouse.move(start['x']+start['width']/2,start['y']+start['height']/2);page.mouse.down()
        page.mouse.move(start['x']+start['width']/2+12,start['y']+start['height']/2+12,steps=4)
        page.mouse.move(x,y,steps=12);page.mouse.move(x+1,y+1,steps=2);page.mouse.up()
        page.wait_for_timeout(600)
    # A pre-existing child starts outside the document. Its first drop becomes a real block.
    fallback=page.locator('a[title="Kéo để đặt trang con vào nội dung"]').filter(has_text='Trang con có sẵn')
    first=editor.locator('.bn-block-outer[data-id]').first
    fallback.scroll_into_view_if_needed()
    page.evaluate("document.querySelector('[data-workspace-scroll]').scrollTop=0")
    # Carry the native drag to the top using mouse edge scrolling.
    fallback.scroll_into_view_if_needed();s=fallback.bounding_box()
    page.mouse.move(s['x']+90,s['y']+s['height']/2);page.mouse.down();page.mouse.move(s['x']+95,s['y']-20,steps=8)
    page.mouse.move(s['x']+95,125,steps=14)
    page.wait_for_function("document.querySelector('[data-workspace-scroll]').scrollTop===0",timeout=10000)
    box=first.bounding_box()
    page.mouse.move(box['x']+110,box['y']+20,steps=12);page.mouse.move(box['x']+115,box['y']+22,steps=3)
    page.mouse.up();page.wait_for_timeout(500)
    if editor.locator('[data-content-type=pageLink]').count()==0:
        # Repeat in a compact viewport-scrolled document; exercise the DOM drag payload end-to-end.
        page.screenshot(path=str(artifacts/'media-drag-failed.png'),full_page=True)
        raise AssertionError('Native child drag did not enter the document')
    link=editor.locator('[data-content-type=pageLink]')
    page.evaluate("document.querySelector('[data-workspace-scroll]').scrollTop=0")
    paragraph=editor.locator('[data-content-type=paragraph]').filter(has_text='Dòng đầu tiên')
    drag(link,paragraph,True)
    rows=order(); li=next(i for i,row in enumerate(rows) if row['type']=='pageLink'); pi=next(i for i,row in enumerate(rows) if 'Dòng đầu tiên' in row['text']);assert li==pi+1,rows
    # The image itself is draggable, independently of the menu button.
    picture=editor.locator('[data-content-type=image] img').first
    drag(picture,paragraph)
    rows=order();ii=next(i for i,row in enumerate(rows) if row['type']=='image');pi=next(i for i,row in enumerate(rows) if 'Dòng đầu tiên' in row['text']);assert ii+1==pi,rows
    moved_ids=[r['id'] for r in rows]
    if production:
        paragraph.click();page.keyboard.press('Control+z');page.wait_for_timeout(650)
        assert [r['id'] for r in order()]!=moved_ids
        page.keyboard.press('Control+Shift+z');page.wait_for_timeout(650)
        assert [r['id'] for r in order()]==moved_ids
    caption=page.get_by_role('textbox',name='Chú thích ảnh',exact=True)
    caption.fill('Chú thích nằm giữa · sửa trực tiếp');expect(caption).to_have_css('text-align','center')
    expect(page.get_by_text('Chỉnh sửa chú thích',exact=True)).to_have_count(0)
    picture.hover();page.get_by_role('button',name='Mở rộng ảnh',exact=True).click()
    expect(page.get_by_role('dialog')).to_be_visible();page.get_by_role('button',name='Phóng to ảnh',exact=True).click();expect(page.get_by_role('button',name='Vừa khung ảnh')).to_have_text('125%')
    page.screenshot(path=str(artifacts/'media-expand.png'))
    page.keyboard.press('Escape');picture.hover();page.get_by_role('button',name='Cắt ảnh',exact=True).click()
    dialog=page.get_by_role('dialog');expect(dialog).to_be_visible()
    handle=dialog.get_by_role('button',name='Cạnh cắt nw',exact=True);box=handle.bounding_box()
    page.mouse.move(box['x']+6,box['y']+6);page.mouse.down();page.mouse.move(box['x']+95,box['y']+45,steps=10);page.mouse.up()
    page.screenshot(path=str(artifacts/'media-crop.png'))
    old_src=picture.get_attribute('src')
    dialog.get_by_role('button',name='Lưu ảnh đã cắt',exact=True).click();expect(dialog).to_have_count(0)
    expect(picture).not_to_have_attribute('src',old_src);expect(caption).to_have_value('Chú thích nằm giữa · sửa trực tiếp')
    dimensions=picture.evaluate('async(img)=>{await img.decode();return {w:img.naturalWidth,h:img.naturalHeight}}');assert 0<dimensions['w']<800 and 0<dimensions['h']<400,dimensions
    # Outline hierarchy, active heading and navigation.
    root=page.locator('[data-workspace-scroll]');root.evaluate('(el)=>el.scrollTop=0')
    nav=page.get_by_role('navigation',name='Mục lục trang');nav.hover()
    h1=nav.get_by_role('button',name='Tổng quan',exact=True);h2=nav.get_by_role('button',name='Phần chi tiết',exact=True);h3=nav.get_by_role('button',name='Mục nhỏ',exact=True)
    indents=[item.evaluate('el=>parseInt(getComputedStyle(el).paddingLeft)') for item in [h1,h2,h3]];assert indents[0]<indents[1]<indents[2],indents
    nav.get_by_role('button',name='Kết luận',exact=True).click();page.wait_for_timeout(1000)
    nav.hover()
    expect(nav.get_by_role('button',name='Kết luận',exact=True)).to_have_attribute('aria-current','location')
    page.screenshot(path=str(artifacts/'media-outline-light.png'))
    page.mouse.move(200,150);root.evaluate('(el)=>el.scrollTop=0')
    page.get_by_role('button',name='Thêm bìa & biểu tượng',exact=True).click()
    page.get_by_label('Tải ảnh bìa lên',exact=True).set_input_files({'name':'cover.png','mimeType':'image/png','buffer':png()})
    expect(page.get_by_alt_text('Xem trước ảnh bìa',exact=True)).to_be_visible()
    page.get_by_role('button',name='Lưu thay đổi',exact=True).click();expect(page.get_by_role('dialog')).to_have_count(0)
    expect(page.get_by_alt_text('Ảnh bìa trang',exact=True)).to_be_visible()
    page.wait_for_timeout(1300);saved_order=[r['type']+':'+r['id'] for r in order()]
    page.reload(wait_until='networkidle');expect(editor).to_be_visible();expect(caption).to_have_value('Chú thích nằm giữa · sửa trực tiếp')
    assert [r['type']+':'+r['id'] for r in order()]==saved_order
    expect(page.get_by_alt_text('Ảnh bìa trang')).to_be_visible()
    page.screenshot(path=str(artifacts/'media-complete-light.png'),full_page=True)
    page.evaluate("localStorage.setItem('bdc-theme','dark')");page.reload(wait_until='networkidle');expect(editor).to_be_visible();nav.hover()
    page.screenshot(path=str(artifacts/'media-complete-dark.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844});page.mouse.move(10,20);root.evaluate('(el)=>el.scrollTop=0')
    page.get_by_role('button',name='Mở mục lục trang',exact=True).click();expect(nav.get_by_role('button',name='Phần chi tiết',exact=True)).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    page.screenshot(path=str(artifacts/'media-complete-mobile.png'),full_page=True)
    assert not errors,errors
    print('PASS: native child/image movement, captions, expand, crop, nested outline, uploaded cover, persistence, light/dark/mobile')
    browser.close()
