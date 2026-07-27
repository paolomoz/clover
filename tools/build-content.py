#!/usr/bin/env python3
"""Generate EDS content pages from the stardust prototypes' captured content.

Media refs use {{m:<captured-filename>}} placeholders resolved to
https://content.da.live/paolomoz/clover/media/clover/<sanitized>. Also emits
tools/media-manifest.json (local path -> DA name) for the uploader.
"""
import json, os, re, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAR = os.path.join(os.path.dirname(ROOT), 'stardust')
MEDIA_BASE = 'https://content.da.live/paolomoz/clover/media/clover'
manifest = {}

def san(name):
    n = name.lower()
    n = re.sub(r'[^a-z0-9.]+', '-', n)
    n = re.sub(r'-+', '-', n).strip('-')
    # collapse inner dots except the extension dot
    base, ext = os.path.splitext(n)
    base = base.replace('.', '-')
    return re.sub(r'-+', '-', base).strip('-') + ext

def m(fname):
    da = san(fname)
    local = os.path.join(STAR, 'current/assets/media', fname)
    if not os.path.exists(local):
        raise SystemExit(f'MISSING LOCAL ASSET: {fname}')
    manifest[local] = da
    return f'{MEDIA_BASE}/{da}'

def esc(t):
    return html.escape(t, quote=False)

def faq_rows(items):
    rows = []
    for it in items:
        paras = [p.strip() for p in re.split(r'\n\s*\n|\n', it['answer']) if p.strip()]
        body = ''
        for p in paras:
            e = esc(p)
            for l in it.get('links', []):
                if not l.get('href') or not l.get('text'):
                    continue
                t = esc(l['text'].split('\n')[0].strip())
                if t and len(t) >= 3 and t in e and ('>' + t + '<') not in e:
                    href = l['href']
                    if href.startswith('/'):
                        href = 'https://www.clover.com' + href
                    e = e.replace(t, f'<a href="{href}">{t}</a>', 1)
            body += f'          <p>{e}</p>\n'
        rows.append(f'        <div>\n          <div>{esc(it["question"])}</div>\n          <div>\n{body}          </div>\n        </div>')
    return '\n'.join(rows)

def metadata(title, desc, extra=''):
    return f'''    <div>
      <div class="metadata">
        <div><div>Title</div><div>{esc(title)}</div></div>
        <div><div>Description</div><div>{esc(desc)}</div></div>
{extra}      </div>
    </div>'''

def section_meta(style):
    return f'''        <div class="section-metadata">
          <div><div>style</div><div>{style}</div></div>
        </div>'''

def device_band():
    return f'''    <div>
      <h2>Want to purchase a device with Clover?</h2>
      <p>It’s never been easier. Set up your Clover POS system with the right mix of devices and apps for your business. Add more devices or apps when you’re ready.</p>
      <p><strong><a href="https://sales.clover.com/connect">Contact sales</a></strong></p>
      <p><img src="{m('Clover.com_Desktop_Footer_-_7040x1798_-_v2_-_max_72dpi__1_-c33740.webp')}" alt="Solo, Mini and Flex devices displaying the order and sale details on the screens"></p>
{section_meta('alt')}
    </div>'''

acc = json.load(open(os.path.join(STAR, 'current/_accordion-content.json')))
pricing_faq = json.load(open(os.path.join(STAR, 'current/_pricing-faq.json')))

pages = {}

# ---------------- contact ----------------
pages['contact'] = f'''<body>
  <header></header>
  <main>
{metadata('Contact us | Clover', 'Contact us for help with your Clover point-of-sale system.')}
    <div>
      <h1>Contact us</h1>
      <div class="accordion">
{faq_rows(acc['pages']['contact']['items'])}
      </div>
    </div>
  </main>
  <footer></footer>
</body>
'''

# ---------------- pricing ----------------
router = [
    ('icon-full-service-dining.svg', 'Full service dining', 'https://www.clover.com/pricing/restaurant', '$179/mo for 36 months (Starter; or $1,799 + $89.95/mo)'),
    ('icon-quick-service-dining.svg', 'Quick‑service restaurant', 'https://www.clover.com/pricing/quick-service-restaurant', '$135/mo for 36 months (Starter; or $849 + $89.95/mo)'),
    ('icon-retail-shops.svg', 'Retail shops', 'https://www.clover.com/pricing/retail', '$16/mo for 36 months (Basic; or $349)'),
    ('icon-professional-office-services.svg', 'Professional services', 'https://www.clover.com/pricing/professional-services', '$0/mo (Starter software plan)'),
    ('icon-health-professional-services.svg', 'Personal services', 'https://www.clover.com/pricing/personal-services', '$16/mo for 36 months (Basic; or $349)'),
    ('icon-home-services.svg', 'Home &amp; field services', 'https://www.clover.com/pricing/home-field-services', '$29.95/mo (Starter: $0 hardware + $29.95/mo software)'),
]
router_rows = '\n'.join(
    f'''        <div>
          <div><img src="{m(icon)}" alt=""></div>
          <div><a href="{href}">{label}</a></div>
          <div>{esc(price)}</div>
        </div>''' for icon, label, href, price in router)

pages['pricing'] = f'''<body>
  <header></header>
  <main>
{metadata('Clover POS System Pricing and Cost', "Explore Clover's POS system pricing options and find the perfect plan for your business needs. Make one-time or monthly payments. Learn more.")}
    <div>
      <h1>Find the right solution to power your business</h1>
      <p class="rate">Pay as little as 2.3% + 10¢ per transaction</p>
      <p><em>Prices shown are only available on Clover.com.</em></p>
      <div class="segment-router">
{router_rows}
      </div>
    </div>
    <div>
      <h2>Every Clover system has business built-in tools</h2>
      <div class="cards tools">
        <div>
          <div><img src="{m('Clover_Payments_01-66f3e2.jpg')}" alt="Merchant taking a card payment on a Clover device"></div>
          <div>
            <h3>Get paid faster</h3>
            <p>Ready to go and simple to use, start taking payments in person, over the phone, online–which ever way your customers want to pay.</p>
            <p><a href="https://www.clover.com/pos-systems/accept-payments">Payments</a></p>
          </div>
        </div>
        <div>
          <div><img src="{m('Clover_Payments_02-d1e340.jpg')}" alt="Business owner reviewing reports on the Clover dashboard"></div>
          <div>
            <h3>Run your business</h3>
            <p>Stay on top of your performance with analytics tools that deliver real-time reports, track key metrics, and provide insights.</p>
            <p><a href="https://www.clover.com/pos-systems/business-tracking-reporting">Tracking &amp; reporting</a></p>
          </div>
        </div>
        <div>
          <div><img src="{m('Clover_Payments_03-460713.jpg')}" alt="Customer joining a loyalty program on a Clover screen"></div>
          <div>
            <h3>Engage your customers</h3>
            <p>Bring customers back with more of what they love–inspiring rewards, valuable promotions, and open lines of communication.</p>
            <p><a href="https://www.clover.com/pos-systems/customer-engagement">Customer loyalty</a></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="columns consult">
        <div>
          <div>
            <h2>Let’s work together to find the right system for your business</h2>
            <p>Our business consultants are available in person or by phone to help you find the right system. We’ll help you get up and running, and then we’re available 24/7/365 for troubleshooting and support.</p>
            <p>We’re here to help—always.</p>
            <p>Call now <a href="tel:+18442911950">(844) 291-1950</a></p>
            <p><strong><a href="https://www.clover.com/contact/connect-to-sales">Schedule a call</a></strong></p>
          </div>
          <div><img src="{m('woman-on-phone-and-laptop-78a157.webp')}" alt="Woman at a counter on the phone with a laptop"></div>
        </div>
      </div>
    </div>
    <div>
      <h2>Frequently Asked Questions</h2>
      <div class="accordion">
{faq_rows(pricing_faq['items'])}
      </div>
    </div>
{device_band()}
  </main>
  <footer></footer>
</body>
'''

# ---------------- pos-systems ----------------
def tile_row(icon, label, body=None, heading=False):
    lab = f'<h3>{label}</h3>' if heading else label
    body_cell = f'\n          <div>{esc(body)}</div>' if body else ''
    return f'''        <div>
          <div><img src="{m(icon)}" alt=""></div>
          <div>{lab}</div>{body_cell}
        </div>'''

stages = f'''        <div>
          <div>
            <h3>Customize your system</h3>
            <ol>
              <li><strong>Start with software</strong> Pick a plan with features to fit your business – payments, inventory and everything in between.</li>
              <li><strong>Hand-pick your hardware</strong> Select a POS device for your business – countertop, portable or no device at all!</li>
              <li><strong>Add accessories and apps</strong> Get Clover-approved accessories and third-party apps from our App Market to maximize your system.</li>
            </ol>
            <p><strong><a href="https://www.clover.com/shop">Shop now</a></strong></p>
          </div>
          <div><img src="{m('mini-3-solo-flex-3-08ed94.png')}" alt="Clover Mini, Station Solo and Flex devices"></div>
        </div>
        <div>
          <div>
            <h3>Process more payments</h3>
            <p><strong>Get paid in all kinds of ways</strong> Tap, dip, swipe, are all welcome here. Accept all major credit/debit cards to mobile wallet and contactless payments - and even scan checks, safely and securely.</p>
            <p><strong>Tackle transactions with ease</strong> Offer one-touch tipping and digital receipts. And, complete refunds, returns, and exchanges efficiently.</p>
            <p><strong>Say hello to efficiency</strong> Enable online ordering so customers can make the most of their time - and you, yours.</p>
            <p><strong>Take care of the rest</strong> Automatically apply service or delivery charges.</p>
            <p><em><a href="https://www.clover.com/pos-systems/accept-payments">Payments</a></em></p>
          </div>
          <div><img src="{m('clover-mini-total-screen-3614fd.webp')}" alt="Clover Mini showing a payment total screen"></div>
        </div>
        <div>
          <div>
            <h3>Optimize ordering</h3>
            <p><strong>Take ’em any way they want</strong> Get in-house, pickup, or delivery orders.</p>
            <p><strong>Make all orders easy</strong> Open tabs, split bills, and combine multiple orders easier.</p>
            <p><strong>Delve into the details</strong> Track item level sales, discounts, taxes, and more.</p>
            <p><em><a href="https://www.clover.com/pos-systems/online-ordering">Online ordering</a></em></p>
          </div>
          <div><img src="{m('pos-clover-station-manage-orders-577a13.png')}" alt="Clover Station screen managing orders"></div>
        </div>
        <div>
          <div>
            <h3>Expand your audience</h3>
            <p><strong>Keep track of customers</strong> Keep your favorite customers top of mind remembering birthdays, order histories and contact info.</p>
            <p><strong>Get valuable feedback</strong> Get private feedback from customers that helps elevate future experiences.</p>
            <p><strong>Reward your regulars</strong> Make and manage your loyalty program directly through our built-in customer engagement app to keep your customers coming back.</p>
            <p><strong>Make marketing magic</strong> Send announcements, custom promotions and marketing campaigns to your customers via email, text, or the free Clover mobile app.</p>
            <p><em><a href="https://www.clover.com/pos-systems/small-business-crm">Customer Relationship Management</a></em></p>
          </div>
          <div><img src="{m('clover-mini-customer-profile-screen-202091.webp')}" alt="Clover Mini showing a customer profile screen"></div>
        </div>
        <div>
          <div>
            <h3>Teaming made simple</h3>
            <p><strong>Set shifts and schedules</strong> Manage your entire staff and their schedules in one place.</p>
            <p><strong>Adjust your admin success</strong> Set individual employee permissions based on your team’s structure and responsibilities.</p>
            <p><strong>Assess your activity</strong> Track employees’ sales, tips, and refunds to identify top sales performers.</p>
            <p><em><a href="https://www.clover.com/pos-systems/employee-management">Employee management</a></em></p>
          </div>
          <div><img src="{m('flex-3-top-Employees-Screen-1700a9.png')}" alt="Clover Flex showing an employees screen"></div>
        </div>'''

pages['pos-systems'] = f'''<body>
  <header></header>
  <main>
{metadata('POS System & Software - Point of Sale Terminal | Clover', "Clover's powerful POS systems & software are built to effortlessly handle the ever-changing parts of your business. See how we can help your business grow!")}
    <div>
      <div class="hero-split">
        <div>
          <div>
            <h1>Win the daily race against the clock with a Clover POS System.</h1>
            <p>With a Clover point of sale (POS) system, you’ll feel like you can handle it all. Have a restaurant, retail, eCommerce, or service business? Our solutions help you manage daily tasks, regardless of where your business is at. From accepting payments to organizing inventory (and so much more), it’s all at your fingertips — anytime, anywhere. Might have you wondering why you didn’t get it sooner.</p>
            <p><strong><a href="https://www.clover.com/build-your-own?step=BUSINESS_OFFERING">Get started</a></strong></p>
          </div>
          <div><img src="{m('clover-duo-printer-mini3-facing-customer-3c34a0.webp')}" alt="Station duo with a processing screen on the mini"></div>
        </div>
      </div>
    </div>
    <div>
      <div class="tiles">
{tile_row('people-group-network-signal-icon.svg', 'Packed with power', 'Clover POS systems come with many built-in features so you can set up your business right away and right-size it for your needs.')}
{tile_row('mobile-phone-vibrate-icon.svg', 'Any time anywhere', 'Cloud-based for good reason. Track your sales, refunds, deposits, and run reports, wherever you are or need to be.')}
{tile_row('completely-customizable-icon.svg', 'Completely customizable', 'Your system, your needs. Tailored to scale with your business with devices, apps, and accessories that make sense when your timing says so.')}
{tile_row('computer-cursor-interface__2_.svg', 'Real‑time reporting', 'Live and trending sales data helps track your business’s performance via customizable reports in your Clover dashboard. It can really be that easy.')}
      </div>
    </div>
    <div>
      <h2>A POS that can manage all your moving parts</h2>
      <div class="moving-parts">
{stages}
      </div>
    </div>
    <div>
      <div class="columns pale">
        <div>
          <div>
            <h2>Faster, stress‑free set‑up – with a little help from our team</h2>
            <p>Convenient, concierge-style set-up support from experts who understand your unique business.</p>
            <p><strong><a href="https://www.clover.com/contact/connect-to-sales">Contact sales</a></strong></p>
          </div>
          <div><img src="{m('features-woman-on-phone-baadf9.png')}" alt="Woman on the phone getting set-up support"></div>
        </div>
      </div>
    </div>
    <div>
      <h2>More POS features, more for your business</h2>
      <div class="tiles">
{tile_row('hand-card-heart-gift-reward-icon.svg', 'Offer and accept gift cards', heading=True)}
{tile_row('hear-feedback-icon.svg', 'Get feedback directly from your customers', heading=True)}
{tile_row('manage-tables-icon.svg', 'Better manage customers and employees', heading=True)}
{tile_row('happy-hour-icon.svg', 'Launch and promote deals and discounts', heading=True)}
      </div>
    </div>
    <div>
      <div class="columns vt">
        <div>
          <div>
            <h2>Take payments anywhere, anytime with Virtual Terminal</h2>
            <p>Accept payments anytime, anywhere with your computer, tablet, or smartphone using Virtual Terminal on your Clover Web Dashboard. No POS device needed!</p>
            <p><em><a href="https://www.clover.com/pos-systems/virtual-terminal">Virtual Terminal</a></em></p>
          </div>
          <div><img src="{m('virtual-terminal-browser-fc633b.png')}" alt="Virtual Terminal in a web browser"></div>
        </div>
      </div>
    </div>
    <div>
      <div class="columns media-left">
        <div>
          <div>
            <h2>Get paid in more ways ‑ ’cause we all like options.</h2>
            <p>In partnership with our parent company, Fiserv, we provide even more solutions and resources for businesses of all types and sizes. There’s something for everyone!</p>
            <p><em><a href="https://merchants.fiserv.com/en-us/products/small-business/">Learn more</a></em></p>
          </div>
          <div><img src="{m('duo2022-printer-mini3-flex3-go3-merchant-1200x800-53d362.png')}" alt="Clover Station Duo, Flex, Go"></div>
        </div>
      </div>
    </div>
    <div>
      <div class="columns apps">
        <div>
          <div>
            <h2>Access to all kinds of apps to help you do things better</h2>
            <p>Customize your Clover POS system with apps that are right for your business like Yelp, Homebase, MailChimp, QuickBooks… and the list goes on!</p>
            <p><em><a href="https://www.clover.com/pos-systems/apps">Apps</a></em></p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h2>Peace of mind with your system</h2>
      <div class="tiles">
{tile_row('box-motion.svg', 'Free overnight shipping*', 'Once you’re approved, your system will arrive in one business day. *Online orders only.', heading=True)}
{tile_row('laptop-card.svg', 'Quick and easy set up', 'Set up your business and start taking payments all in the same day with the Clover Dashboard.', heading=True)}
{tile_row('icon60_rates__1_.svg', 'Consistent rates', 'All cards, including AMEX and rewards cards, feature the same low rates.', heading=True)}
{tile_row('head-set.svg', 'Help when you need it', 'Ready to assist you with everything from setting up to troubleshooting.', heading=True)}
      </div>
      <div class="section-metadata">
        <div><div>style</div><div>alt</div></div>
      </div>
    </div>
    <div>
      <h2>Got questions? We got answers.</h2>
      <div class="accordion">
{faq_rows(acc['pages']['pos-systems']['items'])}
      </div>
    </div>
{device_band()}
  </main>
  <footer></footer>
</body>
'''

# ---------------- restaurant ----------------
ops = [
    ('carousel_1__1_-90d377.webp', 'Take and modify orders', 'Server taking an order tableside with a Clover Flex'),
    ('restaurant-all-in-one-kitchen-350x350-2x-ba0b48.jpg', 'Fire orders to the kitchen', 'Kitchen staff reading orders on a screen'),
    ('restaurant-all-in-one-payments-350x350-2x.jpg', 'Accept payments', 'Customer paying with a card on a Clover device'),
    ('restaurant-all-in-one-tables-350x350-2x.jpg', 'Map your tables', 'Table map on a Clover screen'),
    ('restaurant-all-in-one-service-350x350-2x.jpg', 'Speed up service', 'Server delivering food quickly'),
    ('restaurant-all-in-one-menu-breakpoint-350x234-2x.jpg', 'Create menu categories', 'Menu categories on a Clover screen'),
]
ops_rows = '\n'.join(f'''        <div>
          <div><img src="{m(f)}" alt="{alt}"></div>
          <div><h3>{t}</h3></div>
        </div>''' for f, t, alt in ops)

tools = [
    ('flex_pocket_carousel.webp', 'Flex Pocket', 'This mobile POS is built with a user-friendly interface, robust operations tools, full-day battery life, and digital receipts.'),
    ('customize-your-hardware-flex-3-left-45-top-desktop-374x374-2x.png', 'Flex', 'Take orders tableside or payments on the go with our handheld, 100% mobile POS device.'),
    ('kds-carousel.webp', 'KDS', 'Connect front-of-house service, online orders, and kitchen staff with a Kitchen Display System that serves up everything seamlessly.'),
    ('solo_carousel__2_.png', 'Station Solo', 'The easy-to-use POS that keeps your whole team on the same page from the front of house to the back of the bar.'),
    ('customize-your-hardware-duo-2022-customer-left-45-desktop-374x374-2x.png', 'Station Duo', 'With a dual-screen terminal perfect for high-volume counters, you’ll accept payments and make faster customer transactions.'),
    ('hardware-carousel-mini-3-right-45-650x580.png', 'Mini', 'The small-but-mighty Mini is a compact POS that doesn’t need a lot of counter space to take care of business.'),
    ('customize-your-hardware-go-3-left-45-desktop-374x374-2x.png', 'Go', 'Turn any smartphone into a totally portable point-of-sale system with the Go card reader and Clover Go App.'),
    ('kiosk-restaurant-image.webp', 'Kiosk', 'Our self-ordering kiosk features a commercial display and payment terminal that gives customers more control over their order.'),
]
tools_rows = '\n'.join(f'''        <div>
          <div><img src="{m(f)}" alt="Clover {t}"></div>
          <div><h3>{t}</h3></div>
          <div>{esc(b)}</div>
        </div>''' for f, t, b in tools)

pages['pos-solutions/restaurant'] = f'''<body>
  <header></header>
  <main>
{metadata('Restaurant POS System & Software - POS for Restaurants | Clover', 'Deliver a premier dining experience and keep restaurant operations running smoothly with Clover’s POS systems for full and quick-service restaurants.')}
    <div>
      <div class="photo-hero">
        <div>
          <div>
            <p>Clover for restaurants</p>
            <h1>You bring the flavor, Clover powers the pay</h1>
            <p>Improve efficiencies, reduce costs, and do what you do better with a Clover restaurant pos system.</p>
            <p><strong><a href="https://www.clover.com/build-your-own?step=BUSINESS_OFFERING">Get started with Clover</a></strong> <em><a href="https://sales.clover.com/connect">Contact sales</a></em></p>
          </div>
          <div><img src="{m('restaurant-hero-desktop-1440x520-5c8369.jpg')}" alt="Chef in a kitchen wearing a dark green apron while cooking food on a flat top griddle"></div>
        </div>
      </div>
    </div>
    <div>
      <h2>Manage it all from one system built for restaurants</h2>
      <div class="carousel ops">
{ops_rows}
      </div>
    </div>
    <div>
      <h2>Everything your restaurant needs in one place</h2>
      <div class="section-metadata">
        <div><div>style</div><div>intro</div></div>
      </div>
    </div>
    <div>
      <div class="columns">
        <div>
          <div>
            <p>Front of house</p>
            <h2>From the restaurant floor…</h2>
            <p>Control coursing, menu modifications, seating, and more with ordering and payment solutions at the counter or tableside.</p>
          </div>
          <div><img src="{m('restaurant-front-of-house-ba7f47.webp')}" alt="Server with drinks and a Flex talking to a customer"></div>
        </div>
      </div>
    </div>
    <div>
      <div class="columns stacked">
        <div>
          <div>
            <p>Back of house</p>
            <h2>To the kitchen…</h2>
            <p>Connect the front of house to the back to maintain smooth, efficient service with timed order routing, inventory tracking, and real-time order display.</p>
          </div>
          <div><img src="{m('restaurant-to-the-kitchen-880x410-1x-a1b07e.png')}" alt="Server putting a take-out container into a paper bag with a Kitchen Display System in the background"></div>
        </div>
      </div>
    </div>
    <div>
      <div class="columns media-left">
        <div>
          <div>
            <p>Back office</p>
            <h2>And everything in‑between</h2>
            <p>Boost operational efficiencies, optimize team performance, manage finances, and more—all from a single dashboard designed for restaurant owners and operators.</p>
          </div>
          <div><img src="{m('restaurant-tablet-back-office-desktop-620x514-2x-6ef36f.png')}" alt="Clover dashboard graphic on a tablet showing a restaurant’s daily operations"></div>
        </div>
      </div>
    </div>
    <div>
      <div class="columns media-left">
        <div>
          <div>
            <h2>Online ordering made easy with eCommerce solutions</h2>
            <p>Boost revenue and expand your offerings with commission-free online ordering, delivery management, and seamless integration with third-party delivery apps.</p>
            <p><em><a href="https://www.clover.com/pos-systems/online-ordering">Online ordering</a></em></p>
          </div>
          <div><img src="{m('Restaurant_-_Online_Ordering-41d357.png')}" alt="Food delivery service icons: Uber Eats, Google Restaurants, and more surrounding a Clover logo"></div>
        </div>
      </div>
    </div>
    <div>
      <p><img src="{m('Restaurant_video_thumbnail-ce3664.png')}" alt="Chef plating dishes in a busy restaurant kitchen"></p>
      <div class="section-metadata">
        <div><div>style</div><div>stage</div></div>
      </div>
    </div>
    <div>
      <div class="columns kiosk media-left">
        <div>
          <div>
            <h2>Meet the future of restaurant ordering</h2>
            <p>In quick service restaurants, improving efficiency is a key ingredient. The Clover Kiosk promotes faster service by letting customers place their own orders.</p>
            <h3>Grow your average ticket value</h3>
            <p>Kiosks give customers more freedom and flexibility to browse and customize, leading to higher order values, in addition to cross selling and upselling options within the kiosk software.</p>
            <h3>Streamline operations</h3>
            <p>Front-of-house tasks no longer need as much attention, saving money on labor costs.</p>
            <h3>Integrated workflow</h3>
            <p>Menus are automatically imported and synced across all devices. Easily add pick-up and dine in orders, all while ensuring accuracy and reducing food wastage.</p>
          </div>
          <div><img src="{m('kiosk-qsr-restaurant-image__1_-432b89.webp')}" alt="Kiosk ordering screen with menu item pictures, descriptions, and prices"></div>
        </div>
      </div>
    </div>
    <div>
      <h2>Customize your restaurant tools</h2>
      <div class="carousel tools">
{tools_rows}
      </div>
    </div>
    <div>
      <h2>Take your restaurant to the next level with Clover</h2>
      <div class="cards segments">
        <div>
          <div><img src="{m('restaurant-fsr-540x352-2x.jpg')}" alt="Full-service restaurant staff at work"></div>
          <div>
            <h3>Full‑service restaurant</h3>
            <p>Running a restaurant or bar calls for a tailored, full-service system to keep operations running smoothly.</p>
            <p><a href="https://www.clover.com/pos-solutions/full-service-restaurant">Full‑service restaurants</a></p>
          </div>
        </div>
        <div>
          <div><img src="{m('restaurant-qsr-540x352-2x.jpg')}" alt="Quick-service restaurant counter"></div>
          <div>
            <h3>Quick‑service restaurant</h3>
            <p>With high-volume service, speed matters. Keep your queue moving with a quick service solution for your cafe, food truck, or coffee cart.</p>
            <p><a href="https://www.clover.com/pos-solutions/quick-service-restaurant">Quick‑service restaurants</a></p>
          </div>
        </div>
      </div>
    </div>
{device_band()}
  </main>
  <footer></footer>
</body>
'''

# ---------------- home ----------------
pages['index'] = f'''<body>
  <header></header>
  <main>
{metadata('POS Solutions for Food & Beverage Businesses | Clover', 'A Clover for every small business. Do what you do better with the world’s smartest POS system — payments, hardware, and software for restaurants, retail, and services.',
'''        <div><div>template</div><div>home</div></div>
        <div><div>nav</div><div>/nav-home</div></div>
''')}
    <div>
      <div class="hero">
        <div><div><a href="https://videos.ctfassets.net/v6ivjcl8qjz2/5icZY4hKv1UI6DDLPgNEen/0685e74e3e8d3e14b73ee9874c0ddb37/Clover-Hero-Shoot-Fine-Dining_Table-whitesleeve_16x9_1920x1080_web.mp4">Hero video</a></div></div>
        <div><div><h1>A Clover for every small business</h1></div></div>
        <div><div>Do what you do better with the world’s smartest POS system.</div></div>
        <div><div><p><em><a href="https://www.clover.com/build-your-own?step=BUSINESS_OFFERING">Get Clover</a></em></p><p><strong><a href="https://sales.clover.com/connect">Contact sales</a></strong></p></div></div>
      </div>
    </div>
    <div>
      <div class="segment-band">
        <div><div>Customize by</div></div>
        <div><div>
          <ul>
            <li><a href="https://www.clover.com/m/food-beverage">Food &amp; beverage</a></li>
            <li><a href="https://www.clover.com/m/retail">Retail</a></li>
            <li><a href="https://www.clover.com/m/service-businesses">Services</a></li>
          </ul>
        </div></div>
        <div><div><a href="https://sales.clover.com/connect">Shop one-on-one with our specialists</a></div></div>
      </div>
    </div>
    <div>
      <h2>Keep things flowing with the all‑in‑one restaurant POS</h2>
      <p>Transform your restaurant business with Clover's integrated software solution, designed to streamline operations, enhance guest experiences, and boost profitability through insights.</p>
      <p><strong><a href="https://www.clover.com/pos-solutions/food-beverage">Explore Food &amp; Beverage</a></strong></p>
      <div class="cards">
        <div>
          <div><img src="{m('FoodBeverage_CardRow1_01-380bc7.jpg')}" alt="Server reviewing top-performing dishes on a Clover screen"></div>
          <div><h3>See top‑performing dishes</h3></div>
        </div>
        <div>
          <div><img src="{m('FoodBeverage_CardRow1_02-9a48c0.jpg')}" alt="Manager handling staff scheduling on Clover"></div>
          <div><h3>Manage staff, payroll, and scheduling</h3></div>
        </div>
        <div>
          <div><img src="{m('Keep_online_orders_on_one_platform-132139.png')}" alt="Online orders on one platform"></div>
          <div><h3>Keep online orders on one platform</h3></div>
        </div>
        <div>
          <div><img src="{m('FoodBeverage_CardRow1_04-496c01.jpg')}" alt="Guest becoming a regular at a restaurant"></div>
          <div><h3>Turn first‑time guests into regulars</h3></div>
        </div>
      </div>
    </div>
    <div>
      <div class="hardware">
        <div><div><h2>Restaurant-grade hardware that hustles as hard as you do</h2></div></div>
        <div><div><p><em><a href="https://www.clover.com/shop">Shop devices</a></em> <em><a href="https://www.clover.com/mini">Explore Mini</a></em></p></div></div>
        <div>
          <div>Mini</div>
          <div>A small, efficient system made for countertops.</div>
          <div><img src="{m('Clover_Hardware_Solo-5f30a2.png')}" alt="Clover Mini"></div>
          <div><a href="https://videos.ctfassets.net/v6ivjcl8qjz2/4Noh3ZaxoaFnetVNxpcMgz/e3962e7700999c28a8b70e185ea1be70/09-Mini-Taco-Shop-16x9-Web.mp4">Mini video</a></div>
        </div>
        <div>
          <div>Clover Flex</div>
          <div>A mobile POS for orders tableside.</div>
          <div><img src="{m('Clover_Hardware_Flex-f8586a.png')}" alt="Clover Flex"></div>
          <div><img src="{m('Flex_Hardware_Highlight_Desktop-b22a90.png')}" alt="Clover Flex highlight"></div>
        </div>
        <div>
          <div>Station Duo</div>
          <div>A dual-screen point-of-sale system that does it all.</div>
          <div><img src="{m('Clover_Hardware_Duo-27d719.png')}" alt="Clover Station Duo"></div>
          <div><a href="https://videos.ctfassets.net/v6ivjcl8qjz2/4OglaAEUbKavvP4DiH0dlX/07d1bc61336ad11c4792922e84982b11/02-Duo-Station-Bakery-16x9-Web.mp4">Station Duo video</a></div>
        </div>
        <div>
          <div>Kitchen Display System</div>
          <div>A screen that seamlessly syncs back and front of house.</div>
          <div><img src="{m('Clover_Hardware_KDS-e01036.png')}" alt="Clover Kitchen Display System"></div>
          <div><a href="https://videos.ctfassets.net/v6ivjcl8qjz2/18rOg7WH4RBwtScG1AR6cU/6f12e760c199abd2ddb8447414687fdc/04-KDS-Kitchen-16x9-Web__2_.mp4">KDS video</a></div>
        </div>
        <div>
          <div>Kiosk</div>
          <div>An all-in-one device with display and payment terminal for self-ordering.</div>
          <div><img src="{m('Clover_Hardware_Kiosk-a448d5.png')}" alt="Clover Kiosk"></div>
          <div><a href="https://videos.ctfassets.net/v6ivjcl8qjz2/6bKtCfilnDODXNOWc7FMWm/81884a295d6656319381216285f707f3/03-Kiosk-Restaurant-16x9-Web__1_.mp4">Kiosk video</a></div>
        </div>
      </div>
    </div>
    <div>
      <div class="stats">
        <div><div><h2>Run the numbers</h2></div></div>
        <div>
          <div>4M+</div>
          <div>Devices shipped</div>
          <div>Used by small businesses across restaurants, retail, and the service industry.</div>
        </div>
        <div>
          <div>#1</div>
          <div>POS provider</div>
          <div>Named "Best in Class" by Javelin’s 2025 Small-Business Point-of-Sale System Scorecard.</div>
        </div>
        <div>
          <div>$337B+</div>
          <div>Annualized processing volume</div>
          <div>A testament to Clover’s robust and reliable processing capabilities.</div>
        </div>
      </div>
    </div>
    <div>
      <div class="quote">
        <div><div><a href="https://videos.ctfassets.net/v6ivjcl8qjz2/MmmoceDJwL59svQpbFPDY/db7919ad3fc64d12ae517228012c26f4/Clover_FullService_Testimonial.mp4">Testimonial video</a></div></div>
        <div><div>I consider clover our third arm ... allowing us to focus on business not paperwork.</div></div>
        <div><div>Robert Cucco</div></div>
        <div><div>Table 87</div></div>
        <div><div><img src="{m('RobertCucco-e42b0b.png')}" alt="Robert Cucco"></div></div>
      </div>
    </div>
    <div>
      <h2>All of your online orders, in one place</h2>
      <p>Drive revenue and deliver more to customers with commission‑free online ordering, delivery management, and easy integration with third‑party delivery apps.</p>
      <p><strong><a href="https://www.clover.com/pos-solutions/online-ordering">Explore Online Ordering</a></strong></p>
      <div class="cards">
        <div>
          <div><img src="{m('FoodBeverage_CardRow2_01-428445.jpg')}" alt="Third-party delivery integrations"></div>
          <div>
            <h3>Third‑party integrations</h3>
            <p>Connect to leading online ordering platforms and streamline your sales processes for maximum efficiency.</p>
          </div>
        </div>
        <div>
          <div><img src="{m('FoodBeverage_CardRow2_02-6bdfcf.jpg')}" alt="Custom website ordering"></div>
          <div>
            <h3>Custom website</h3>
            <p>Add online ordering to your website with zero hassle for integrated menu management, order processing, and inventory tracking.</p>
          </div>
        </div>
        <div>
          <div><img src="{m('FoodBeverage_CardRow2_03-1dea81.jpg')}" alt="Hosted checkout page"></div>
          <div>
            <h3>Hosted checkout</h3>
            <p>Power smooth transactions with a secure, customizable, and mobile‑friendly checkout page.</p>
          </div>
        </div>
        <div>
          <div><img src="{m('FoodBeverage_CardRow2_04-a247c7.jpg')}" alt="Pickup and delivery management"></div>
          <div>
            <h3>Pickup and delivery</h3>
            <p>Streamline operations with a single system for online ordering, menu management, and order processing.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
  <footer></footer>
</body>
'''

os.makedirs(os.path.join(ROOT, 'content/pos-solutions'), exist_ok=True)
for path, htmlout in pages.items():
    out = os.path.join(ROOT, 'content', path + '.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w').write(htmlout)
    print('wrote', out, len(htmlout), 'bytes')

# chrome media
for f in ['clover-logo.5637c88fda21055b797e300e16140c95.svg',
          'clover-logo-dark-green.e18af555ab73d88c83d138ce5e687b15.svg',
          'social-facebook.svg', 'social-x.svg', 'social-instagram.svg',
          'social-youtube.svg', 'social-linkedin.svg', 'social-github.svg']:
    m(f)
# chrome content references clover-logo.svg / clover-logo-dark-green.svg (clean names)
manifest[os.path.join(STAR, 'current/assets/media/clover-logo.5637c88fda21055b797e300e16140c95.svg')] = 'clover-logo.svg'
manifest[os.path.join(STAR, 'current/assets/media/clover-logo-dark-green.e18af555ab73d88c83d138ce5e687b15.svg')] = 'clover-logo-dark-green.svg'

json.dump(manifest, open(os.path.join(ROOT, 'tools/media-manifest.json'), 'w'), indent=1)
print('manifest:', len(manifest), 'assets')
