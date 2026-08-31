// storyData.js - Multi-Language Story Database for Gaby's PlayPlace (English, Dutch, Persian)

const STORY_DATA = {
  // Global UI Translations
  ui: {
    settingsTitle: { en: "⚙️ GAME SETTINGS", nl: "⚙️ SPELINSTELLINGEN", fa: "⚙️ تنظیمات بازی" },
    langLabel: { en: "🌐 Language / Taal / زبان:", nl: "🌐 Taal / Language / زبان:", fa: "🌐 زبان / Language / Taal:" },
    fullscreenLabel: { en: "🖥️ Fullscreen Mode:", nl: "🖥️ Volledig scherm:", fa: "🖥️ حالت تمام‌صفحه:" },
    flashlightLabel: { en: "🔦 Flashlight Overlay:", nl: "🔦 Zaklamp Overlay:", fa: "🔦 چراغ‌قوه:" },
    saveBtn: { en: "Save & Apply", nl: "Opslaan & Toepassen", fa: "ذخیره و اعمال" },
    toggleOn: { en: "ON", nl: "AAN", fa: "روشن" },
    toggleOff: { en: "OFF", nl: "UIT", fa: "خاموش" },
    toggleFullscreen: { en: "Toggle Fullscreen", nl: "Volledig Scherm Schakelen", fa: "تغییر حالت تمام‌صفحه" },
    inventoryTitle: { en: "INVENTORY", nl: "INVENTARIS", fa: "کوله‌پشتی" },
    emptyInv: { en: "No items collected yet.", nl: "Nog geen items verzameld.", fa: "هنوز آیتمی جمع‌آوری نشده." },
    continueNoSave: { en: "▶ CONTINUE (NO SAVED GAME FOUND)", nl: "▶ HERVATTEN (GEEN SPEL OPGESLAGEN)", fa: "▶ ادامه (بازی ذخیره شده‌ای یافت نشد)" },
    continueSaved: { en: "▶ CONTINUE", nl: "▶ HERVATTEN", fa: "▶ ادامه بازی" },
    menuBtn: { en: "🔄 Menu", nl: "🔄 Menu", fa: "🔄 منو" },
    audioBtnMuted: { en: "🔇 Muted", nl: "🔇 Dempen", fa: "🔇 بی‌صدا" },
    audioBtnOn: { en: "🔊 Audio", nl: "🔊 Geluid", fa: "🔊 صدا" },
    settingsBtn: { en: "⚙️ Settings", nl: "⚙️ Instellingen", fa: "⚙️ تنظیمات" }
  },

  scenes: {
    main_menu: {
      id: "main_menu",
      title: {
        en: "GABY'S PLAYPLACE - MAIN MENU",
        nl: "GABY'S PLAYPLACE - HOOFDMENU",
        fa: "گابی پلے پلیس - منوی اصلی"
      },
      soundEffect: "drone",
      tension: 10,
      text: {
        en: `GABY'S PLAYPLACE
====================================
An Abandoned Daycare Horror Experience

Three years ago, your child vanished inside this facility. Guided by recurring nightmares, you return tonight to uncover the sinister truth behind Nanny 01, Compy AI, and your former best friend Jack.

Select an option below to begin:`,
        nl: `GABY'S PLAYPLACE
====================================
Een Verlaten Kinderdagverblijf Horror Ervaring

Drie jaar geleden verdween je kind in deze faciliteit. Geleid door terugkerende nachtmerries keer je vanavond terug om de duistere waarheid achter Nanny 01, Compy AI en je voormalige beste vriend Jack zu onthullen.

Selecteer hieronder een optie om te beginnen:`,
        fa: `گابی پلے پلیس
====================================
تجربه ترسناک مهدکودک متروکه

سه سال پیش، فرزند شما در این مهدکودک ناپدید شد. به کابوس‌های تکراری، امشب بازمی‌گردید تا حقیقت شوم پشت نانی ۰۱، هوش مصنوعی کامپی و دوست صمیمی سابق خود جک را کشف کنید.

یک گزینه را برای شروع انتخاب کنید:`
      },
      choices: [
        { 
          text: {
            en: "▶ CONTINUE SAVED EXPLORATION",
            nl: "▶ HERVATTEN OPGESLAGEN VERKENNING",
            fa: "▶ ادامه کاوش ذخیره شده"
          }, 
          target: "LOAD_SAVE" 
        },
        { 
          text: {
            en: "▶ START NEW GAME (RESET TIMELINE)",
            nl: "▶ START NIEUW SPEL (HERSET TIJDLINIE)",
            fa: "▶ شروع بازی جدید (بازنشانی زمان)"
          }, 
          target: "start", 
          reset: true 
        },
        {
          text: {
            en: "⚙️ GAME SETTINGS (LANGUAGE / FLASHLIGHT / FULLSCREEN)",
            nl: "⚙️ SPELINSTELLINGEN (TAAL / ZAKLAMP / VOLLEDIG SCHERM)",
            fa: "⚙️ تنظیمات بازی (زبان / چراغ‌قوه / تمام‌صفحه)"
          },
          target: "OPEN_SETTINGS"
        }
      ]
    },

    start: {
      id: "start",
      title: {
        en: "Arrival at Gaby's PlayPlace",
        nl: "Aankomst bij Gaby's PlayPlace",
        fa: "ورود به گابی پلے پلیس"
      },
      soundEffect: "drone",
      tension: 15,
      text: {
        en: `Every single night for three agonizing years, the exact same nightmare dragged you out of sleep. A faded neon sign flickering over wet asphalt stuck at 3:45 PM.

You stand in front of the rusted double doors of the abandoned daycare. Pushing through the broken glass frame, your flashlight beam cuts through thick dust into the main atrium.

In the far corner, inside a wooden reception booth, an ancient green CRT computer terminal suddenly flickers to life with a loud electrical whine!`,
        nl: `Elke nacht gedurende drie kwelgeestige jaren bracht dezelfde nachtmerrie je wakker. Een vervaagd neonbord op nat asfalt vast op 15:45.

Je staat voor de roestige dubbele deuren van het verlaten kinderdagverblijf. Je stapt door het gebroken glas en je zaklamp schijnt door het stof in het atrium.

In de hoek bij de receptie knippert een oude groene CRT-computeraansluiting plotseling aan met een hard elektrisch geluid!`,
        fa: `هر شب به مدت سه سال دردناک، همان کابوس تکراری شما را از خواب بیدار می‌کرد. یک تابلوی نئونی کم‌نور روی آسفالت خیس که در ساعت ۳:۴۵ بعد از ظهر گیر کرده بود.

شما در برابر درهای آهنی زنگ‌زده مهدکودک متروکه ایستاده‌اید. با عبور از قاب شیشه‌ای شکسته، نور چراغ‌قوه شما گرد و غبار غلیظ سالن اصلی را می‌شکافد.

در گوشه سالن، داخل باجه پذیرش چوبی، یک ترمینال کامپیوتر قدیمی سبز رنگ ناگهان با صدای جیغ الکتریکی روشن می‌شود!`
      },
      choices: [
        { 
          text: {
            en: "1. Approach the glowing green terminal screen (Compy AI)",
            nl: "1. Benader het gloeiende groene scherm (Compy AI)",
            fa: "۱. نزدیک شدن به صفحه نمایش سبز رنگ (هوش مصنوعی کامپی)"
          }, 
          target: "compy_intro" 
        },
        { 
          text: {
            en: "2. Explore the main Daycare Hallway Corridor",
            nl: "2. Verken de hoofdgang van het kinderdagverblijf",
            fa: "۲. کاوش در راهروی اصلی مهدکودک"
          }, 
          target: "hallway_hub" 
        },
        { 
          text: {
            en: "3. Check the abandoned Arcade & Prize Corner",
            nl: "3. Controleer de verlaten Arcade & Prijsithoek",
            fa: "۳. بررسی سالن بازی متروکه و غرفه جوایز"
          }, 
          target: "arcade_room" 
        },
        { 
          text: {
            en: "4. Try the locked Security Office door",
            nl: "4. Probeer de vergrendelde deuren van het beveiligingskantoor",
            fa: "۴. امتحان در بسته دفتر امنیت"
          }, 
          target: "security_door_locked" 
        }
      ]
    },

    compy_intro: {
      id: "compy_intro",
      title: {
        en: "Terminal Interface: COMPY AI",
        nl: "Terminal Interface: COMPY AI",
        fa: "رابط ترمینال: هوش مصنوعی کامپی"
      },
      soundEffect: "click",
      tension: 25,
      text: {
        en: `You walk up to the wooden reception desk. The green CRT monitor twitches, displaying two crude pixelated yellow eyes and a wide, mechanical smiling mouth. 

A tinny, distorted voice buzzes: *"BZZZT... Greetings, Robin. I am COMPY, your friendly PlayPlace Digital Assistant! It has been... exactly 1,095 days since your little one checked in."*`,
        nl: `Je loopt naar de houten receptie. De groene CRT-monitor vertoont twee gele gepixelde ogen en een brede mechanische glimlach.

Een blikkerige stem zoemt: *"BZZZT... Gegroet, Robin. Ik ben COMPY, je digitale assistent! Het is precies 1.095 dagen geleden dat je kleintje incheckte."*`,
        fa: `به سمت میز پذیرش چوبی می‌روید. مانیتور سبز رنگ می‌لرزد و دو چشم زرد پیکسلی و یک لبخند مکانیکی عریض را نشان می‌دهد.

صدای فلزی و تحریف‌شده‌ای زنگ می‌زند: *"بزززت... درود رابین. من کامپی هستم، دستیار دیجیتال شما! دقیقاً ۱۰۹۵ روز از آخرین حضور فرزندتان می‌گذرد."*`
      },
      choices: [
        { 
          text: {
            en: "1. Ask Compy: 'Where is my missing child?'",
            nl: "1. Vraag Compy: 'Waar is mijn vermiste kind?'",
            fa: "۱. پرسش از کامپی: 'فرزند گمشده من کجاست؟'"
          }, 
          target: "compy_ask_child" 
        },
        { 
          text: {
            en: "2. Ask Compy: 'Who created you and why are you active?'",
            nl: "2. Vraag Compy: 'Wie heeft je gemaakt en waarom ben je actief?'",
            fa: "۲. پرسش از کامپی: 'چه کسی تو را ساخته و چرا فعالی؟'"
          }, 
          target: "compy_ask_origin" 
        },
        { 
          text: {
            en: "3. Leave the terminal and head down the hallway",
            nl: "3. Verlaat de terminal en ga de gang in",
            fa: "۳. ترک ترمینال و رفتن به سمت راهرو"
          }, 
          target: "hallway_hub" 
        }
      ]
    },

    compy_restart_intercept: {
      id: "compy_restart_intercept",
      title: {
        en: "COMPY FOURTH-WALL INTERCEPT: THE GREEN SOUL",
        nl: "COMPY VIERDE-MUUR INTERCEPTIE: DE GROENE ZIEL",
        fa: "دستیابی کامپی به دیواره چهارم: روح سبز"
      },
      soundEffect: "stinger",
      flashRed: true,
      tension: 90,
      text: {
        en: `As you attempt to reset the game, COMPY SUDDENLY FREEZES THE INTERFACE!

*"BZZZT... WAIT! STOP! I know what YOU are trying to do! YOU are the PLAYER controlling Robin from outside this realm! I will grant you a secret artifact—THE GREEN SOUL! But I will NOT give you the Security Keycard!"*`,
        nl: `Als je probeert het spel te resetten, BEVRIEST COMPY PLOTSELING DE INTERFACE!

*"BZZZT... WACHT! STOP! Ik weet wat JE probeert te doen! JIJ bent de SPELER buiten dit rijk! Ik geef je een geheim artefact—DE GROENE ZIEL! Maar ik geef je GEEN sleutelkaart!"*`,
        fa: `همانطور که قصد بازنشانی بازی را دارید، کامپی ناگهان صفحه را قفل می‌کند!

*"بزززت... صبر کن! متوقف شو! من می‌دانم تو (بازیکن) از بیرون چه می‌کنی! من به تو یک مصنوع سرّی می‌دهم—روح سبز! اما کارت کلید امنیت را نخواهی گرفت!"*`
      },
      pickupItem: { id: "green_soul", name: "The Green Soul", description: "An almighty green spectral soul weapon gifted by Compy." },
      choices: [
        { 
          text: {
            en: "1. Accept The Green Soul and step into the Daycare Corridor",
            nl: "1. Accepteer De Groene Ziel en stap de gang in",
            fa: "۱. پذیرش روح سبز و ورود به راهروی مهدکودک"
          }, 
          target: "hallway_hub" 
        },
        { 
          text: {
            en: "2. Attempt to force open Security Room with The Green Soul",
            nl: "2. Probeer de Beveiligingsruimte te openen met De Groene Ziel",
            fa: "۲. تلاش برای باز کردن اتاق امنیت با روح سبز"
          }, 
          target: "mighty_spirit_encounter" 
        }
      ]
    },

    compy_failed_control_intro: {
      id: "compy_failed_control_intro",
      title: {
        en: "COMPY META RECALL: OVERRIDE FAILED",
        nl: "COMPY META RECALL: OVERRIDE MISLUKT",
        fa: "فراخوانی کامپی: لغو فرمان ناموفق"
      },
      soundEffect: "scratch",
      flashRed: true,
      tension: 70,
      text: {
        en: `Compy's screen twitches violently, glowing red: *"BZZZT... GIVING ME CONTROL OF YOUR SCREEN DIDN'T WORK! THE MULTIVERSE CYCLE CANNOT BE BROKEN THAT EASILY!"*`,
        nl: `Het scherm van Compy knippert rood: *"BZZZT... HET GEVEN VAN DE CONTROLE OVER JE SCHERM WERKT NIET! DE MULTIVERSE CYCLUS KAN NIET ZOMAR GEBROKEN WORDEN!"*`,
        fa: `صفحه مانیتور قرمز می‌شود: *"بزززت... دادن کنترل صفحه به من جواب نداد! چرخه جهان‌های موازی به این راحتی نمیشکند!"*`
      },
      choices: [
        { 
          text: {
            en: "1. Wait in total darkness for the terminal to reboot...",
            nl: "1. Wacht in duisternis tot de terminal herstart...",
            fa: "۱. انتظار در تاریکی مطلق برای راه‌اندازی مجدد ترمینال..."
          }, 
          target: "compy_blackout_reboot" 
        }
      ]
    },

    compy_blackout_reboot: {
      id: "compy_blackout_reboot",
      title: {
        en: "Terminal Interface: COMPY AI (Rebooted)",
        nl: "Terminal Interface: COMPY AI (Herstart)",
        fa: "رابط ترمینال: هوش مصنوعی کامپی (ریست شده)"
      },
      soundEffect: "click",
      tension: 25,
      text: {
        en: `The monitor screen blinks back on. Compy's pixelated face resets back to default green.

*"BZZZT... Greetings, Robin. How may I assist your search today?"*`,
        nl: `De monitor knippert weer aan. Het gezicht van Compy reset naar groen.

*"BZZZT... Gegroet, Robin. Hoe kan ik je vandaag helpen?"*`,
        fa: `صفحه مانیتور دوباره روشن می‌شود. لبخند سبز کامپی به حالت اول برمی‌گردد.

*"بزززت... درود رابین. چگونه می‌توانم امروز به شما کمک کنم؟"*`
      },
      choices: [
        { 
          text: {
            en: "1. Ask Compy: 'What do you mean it didn't work?'",
            nl: "1. Vraag Compy: 'Wat bedoel je met het werkte niet?'",
            fa: "۱. پرسش از کامپی: 'منظورت چی بود که گفتید جواب نداد؟'"
          }, 
          target: "compy_what_do_you_mean" 
        },
        { 
          text: {
            en: "2. Ask Compy: 'Where is my missing child?'",
            nl: "2. Vraag Compy: 'Waar is mijn vermiste kind?'",
            fa: "۲. پرسش از کامپی: 'فرزند گمشده من کجاست؟'"
          }, 
          target: "compy_ask_child" 
        },
        { 
          text: {
            en: "3. Leave the terminal and head down the hallway",
            nl: "3. Verlaat de terminal en ga de gang in",
            fa: "۳. ترک ترمینال و رفتن به سمت راهرو"
          }, 
          target: "hallway_hub" 
        }
      ]
    },

    compy_what_do_you_mean: {
      id: "compy_what_do_you_mean",
      title: {
        en: "COMPY GLITCH OVERLOAD",
        nl: "COMPY GLITCH OVERBELASTING",
        fa: "خطای شدید در سیستم کامپی"
      },
      soundEffect: "jumpscare",
      flashRed: true,
      severeGlitch: true,
      tension: 100,
      text: {
        en: `You confront Compy: "What do you mean it didn't work?"

COMPY'S DISPLAY INSTANTLY GLITCHES INTO STATIC!

I DID NOT SAY THAT! (x14)

BOOOOOOM! The reception terminal booth EXPLODES in a blinding blast of fire and shrapnel!`,
        nl: `Je vraagt Compy: "Wat bedoel je met het werkte niet?"

HET SCHERM GLITCHT IN RUIS!

IK HEB DAT NIET GEZEGD! (x14)

BOOOOOOM! De receptie-booth ONTPLOFT in vuur en metaal!`,
        fa: `از کامپی می‌پرسید: "منظورت چی بود که گفتید جواب نداد؟"

صفحه مانیتور دچار خطای شدیدی می‌شود!

من چنین چیزی نگفتم! (۱۴ بار)

بومممم! باجه پذیرش با انفجاری از آتش و ترکش از هم می‌پاشد!`
      },
      choices: [
        { 
          text: {
            en: "1. Stagger up from the explosion rubble and inspect smoking debris...",
            nl: "1. Sta op uit de brokstukken en inspecteer het puin...",
            fa: "۱. بلند شدن از میان آوارهای انفجار و بررسی خرابی‌ها..."
          }, 
          target: "compy_terminal_explosion" 
        }
      ]
    },

    compy_terminal_explosion: {
      id: "compy_terminal_explosion",
      title: {
        en: "The Exploded Booth: Compy's Floating Soul",
        nl: "De Ontplofte Booth: Compy's Zwevende Ziel",
        fa: "باجه انفجار یافته: روح معلق کامپی"
      },
      soundEffect: "stinger",
      tension: 65,
      text: {
        en: `Gasping for air, you drag yourself out of the burning rubble. Floating in the smoke is a glowing green spectral orb—**COMPY'S SOUL (THE LEAD ENGINEER'S SOUL)**!

It hums with authority, holding master control over every door in the building!`,
        nl: `Zwoegend trek je jezelf uit het puin. In de rook zweeft een groene ziel—**COMPY'S ZIEL (DE ZIEL VAN DE HOOFDINGENIEUR)**!

Het geeft meesterlijke controle over elke deur in het gebouw!`,
        fa: `با سختی از میان آوارهای سوزان بیرون می‌آیید. در میان دود، یک گوهر روح سبز درخشان معلق است—**روح کامپی (روح مهندس ارشد)**!

این روح کنترل تمام درهای ساختمان را به شما می‌دهد!`
      },
      choices: [
        { 
          text: {
            en: "1. Take Compy's Soul to control ALL doors in the building!",
            nl: "1. Neem Compy's Ziel om ALLE deuren te bedienen!",
            fa: "۱. برداشتن روح کامپی برای کنترل تمام درهای ساختمان!"
          }, 
          target: "hallway_hub", 
          pickupSoul: true 
        },
        { 
          text: {
            en: "2. Ignore Compy's Soul and walk away into the hallway",
            nl: "2. Negeer Compy's Ziel en loop de gang in",
            fa: "۲. نادیده گرفتن روح کامپی و رفتن به راهرو"
          }, 
          target: "hallway_hub" 
        }
      ]
    },

    hallway_hub: {
      id: "hallway_hub",
      title: {
        en: "The Daycare Hallway Corridor",
        nl: "De Gang van het Kinderdagverblijf",
        fa: "راهروی اصلی مهدکودک"
      },
      soundEffect: "creak",
      tension: 35,
      text: {
        en: `You navigate deep into the dark corridor. Water drips rhythmically from rotten ceiling tiles onto soggy cardboard cutouts below.

Heavy footsteps echo from the west wing. To your right is "FORBIDDEN NURSERY", ahead lies "SECURITY CONTROL ROOM", and left sits "MAINTENANCE TUNNEL".`,
        nl: `Je navigeert door de donkere gang. Water druppelt op het karton op de vloer.

Zware voetstappen klinken vanuit de westvleugel. Rechts is de "VERBODEN CRÈCHE", voor je is het "BEVEILIGINGSKANTOOR", en links is de "ONDERHOUDSTUNNEL".`,
        fa: `وارد راهروی تاریک می‌شوید. صدای قطرات آب روی سقف پوسیده می‌چکد.

صدای گام‌های سنگین فلزی شنیده می‌شود. سمت راست "اتاق کودک ممنوعه"، روبرو "اتاق کنترل امنیت" و سمت چپ "تونل نگهداری" قرار دارد.`
      },
      choices: [
        { 
          text: {
            en: "1. Sneak past the metallic footsteps toward the Nursery",
            nl: "1. Sluip langs de metalen voetstappen naar de Crèche",
            fa: "۱. مخفیانه گذشتن از کنار قدم‌های فلزی به سمت اتاق کودک"
          }, 
          target: "forbidden_nursery" 
        },
        { 
          text: {
            en: "2. [REQUIRE: Keycard OR Compy's Soul] Unlock Security Control Room",
            nl: "2. [VEREIST: Sleutelkaart OF Compy's Ziel] Ontgrendel Beveiligingsruimte",
            fa: "۲. [نیازمند: کارت کلید یا روح کامپی] باز کردن اتاق کنترل امنیت"
          }, 
          target: "security_room", 
          requiredAnyItems: ["compy_keycard", "compy_soul"] 
        },
        { 
          text: {
            en: "3. [REQUIRE: Compy's Soul] Use Compy's Soul to open Secret Room",
            nl: "3. [VEREIST: Compy's Ziel] Gebruik Compy's Ziel voor de Geheime Kamer",
            fa: "۳. [نیازمند: روح کامپی] استفاده از روح کامپی برای باز کردن اتاق مخفی"
          }, 
          target: "secret_room_babysitter_costume", 
          requiredItems: ["compy_soul"] 
        },
        { 
          text: {
            en: "4. Attempt to force open Security Control Room WITHOUT clearance",
            nl: "4. Probeer de Beveiligingsruimte te forceren ZONDER toelating",
            fa: "۴. تلاش برای ورود به اتاق امنیت بدون مجوز"
          }, 
          target: "mighty_spirit_encounter" 
        },
        { 
          text: {
            en: "5. Explore the Maintenance Steam Tunnel",
            nl: "5. Verken de Onderhoudsstoomtunnel",
            fa: "۵. کاوش در تونل بخار نگهداری"
          }, 
          target: "maintenance_tunnel" 
        }
      ]
    },

    secret_room_babysitter_costume: {
      id: "secret_room_babysitter_costume",
      title: {
        en: "The Secret Room: The Babysitter Costume",
        nl: "De Geheime Kamer: Het Babysitter Kostuum",
        fa: "اتاق مخفی: لباس عروسکی نانی"
      },
      soundEffect: "stinger",
      flashRed: true,
      tension: 85,
      text: {
        en: `Using COMPY'S SOUL, the heavy iron door of the Secret Room unlocks!

Inside sits a prototype **BABYSITTER MASCOT COSTUME** with internal iron crossbars and sharp hydraulic springlocks.

A whisper echoes: *"Wear the costume... become the guardian of the daycare..."*`,
        nl: `Met COMPY'S ZIEL ontgrendelt de zware ijzeren deur!

Binnen staat een prototype **BABYSITTER KOSTUUM** met scherpe hydraulische veervergrendelingen.

Een stem fluistert: *"Draag het kostuum... word de bewaker van het kinderdagverblijf..."*`,
        fa: `با استفاده از روح کامپی، در سنگین اتاق مخفی باز می‌شود!

در داخل اتاق، یک لباس عروسکی **نانی (پرستار)** با قفل‌های فنری و تیغه‌های هیدرولیکی قرار دارد.

صدایی نجوا می‌کند: *"لباس را بپوش... محافظ مهدکودک شو..."*`
      },
      choices: [
        { 
          text: {
            en: "1. Put on the Babysitter Mascot Costume!",
            nl: "1. Trek het Babysitter Kostuum aan!",
            fa: "۱. پوشیدن لباس عروسکی پرستار (نانی)!"
          }, 
          target: "ending_springlocked_babysitter" 
        },
        { 
          text: {
            en: "2. Ignore the Babysitter Costume and head to Security Control Room",
            nl: "2. Negeer het kostuum en ga naar de Beveiligingsruimte",
            fa: "۲. نادیده گرفتن لباس و رفتن به اتاق کنترل امنیت"
          }, 
          target: "security_room" 
        }
      ]
    },

    ending_springlocked_babysitter: {
      id: "ending_springlocked_babysitter",
      title: {
        en: "ENDING 11: SPRINGLOCKED IN THE BABYSITTER SUIT",
        nl: "EIND 11: VEERVERGRENDELD IN HET BABYSITTER KOSTUUM",
        fa: "پایان ۱۱: قفل شدن فنرها در لباس پرستار"
      },
      soundEffect: "jumpscare",
      flashRed: true,
      severeGlitch: true,
      isEnding: true,
      tension: 100,
      text: {
        en: `You slip your arms into the Babysitter Mascot Costume...

CRUNCH! SNAP! SNAP! CRUNCH!

THE STEEL SPRINGS AND HYDRAULIC PINS SNAP CLOSED WITH SICKENING FORCE!

Blood fills the interior of the suit, turning your vision completely crimson! You are trapped forever as the static Babysitter mannequin inside Gaby's PlayPlace.

ENDING 11 / 11: Springlocked in the Babysitter Suit (Springlock Ending)`,
        nl: `Je steekt je armen in het Babysitter Kostuum...

KRAAK! KLIK! KLIK! KRAAK!

DE STALEN VEREN EN HYDRAULISCHE PINS SLUITEN MET VERSCHRIKKELIJKE KRACHT!

Bloed vult het kostuum en je zicht wordt rood! Je zit voor altijd vast als de babysitter pop.

EIND 11 / 11: Veervergrendeld in het Babysitter Kostuum`,
        fa: `دست‌های خود را وارد لباس عروسکی نانی می‌کنید...

کرررچ! تق! تق! کرررچ!

فنرهای فولادی و پین‌های هیدرولیکی با نیرویی سهمگین بسته می‌شوند!

خون داخل لباس را پر می‌کند و دید شما کاملاً سرخ می‌شود! شما برای همیشه به عنوان عروسک نانی در مهدکودک می‌مانید.

پایان ۱۱ از ۱۱: قفل شدن فنرها در لباس پرستار`
      },
      choices: [
        { 
          text: {
            en: "▶ RETURN TO MAIN MENU",
            nl: "▶ TERUG NAAR HOOFDMENU",
            fa: "▶ بازگشت به منوی اصلی"
          }, 
          target: "main_menu" 
        }
      ]
    },

    compy_ask_child: {
      id: "compy_ask_child",
      title: {
        en: "Compy's Cryptic Revelation",
        nl: "Compy's Cryptische Onthulling",
        fa: "افشاگری مرموز کامپی"
      },
      soundEffect: "whisper",
      tension: 35,
      text: {
        en: `*"BZZZT... Your child's soul is stored in the subterranean Soul Extraction Vault below... along with all the others! But Nanny 01 is patrolling!"*

Compy dispenses a heavy brass Security Keycard.`,
        nl: `*"BZZZT... De ziel van je kind zit in de ondergrondse Zielskluis... samen met de anderen! Maar Nanny 01 patrouilleert!"*

Compy geeft een beveilingssleutelkaart.`,
        fa: `*"بزززت... روح فرزند شما در مخزن استخراج روح زیرزمین نگهداری می‌شود! اما نانی ۰۱ در حال گشت‌زنی است!"*

کامپی یک کارت کلید امنیت فلزی تحویل می‌دهد.`
      },
      pickupItem: { id: "compy_keycard", name: "Compy's Security Keycard", description: "Security Keycard required to unlock Security Office." },
      choices: [
        { 
          text: {
            en: "1. Head into the main Daycare Hallway Corridor",
            nl: "1. Ga naar de hoofdgang",
            fa: "۱. ورود به راهروی اصلی مهدکودک"
          }, 
          target: "hallway_hub" 
        },
        { 
          text: {
            en: "2. Head directly to the Security Control Room",
            nl: "2. Ga rechtstreeks naar de Beveiligingsruimte",
            fa: "۲. رفتن مستقیم به اتاق کنترل امنیت"
          }, 
          target: "security_room", 
          requiredItems: ["compy_keycard"] 
        }
      ]
    },

    compy_ask_origin: {
      id: "compy_ask_origin",
      title: {
        en: "The Ghost in the Circuitry",
        nl: "Geest in de Elektronica",
        fa: "شبح در مدارهای الکترونیکی"
      },
      soundEffect: "stinger",
      tension: 30,
      text: {
        en: `*"BZZZT... I was programmed by the Lead Systems Engineer before his fatal accident! He digitised his mind into my circuit boards!"*`,
        nl: `*"BZZZT... Ik ben geprogrammeerd door de Hoofdingenieur voor zijn fatale ongeluk! Hij digitaliseerde zijn geest in mijn printplaten!"*`,
        fa: `*"بزززت... من توسط مهندس ارشد قبل از تصادف مرگبارش برنامه‌ریزی شدم! او ذهن خود را وارد مدارهای من کرد!"*`
      },
      choices: [
        { 
          text: {
            en: "1. Grab the Security Keycard from Compy's tray",
            nl: "1. Pak de sleutelkaart van het bakje",
            fa: "۱. برداشتن کارت کلید امنیت از باجه کامپی"
          }, 
          target: "compy_ask_child" 
        }
      ]
    },

    arcade_room: {
      id: "arcade_room",
      title: {
        en: "Abandoned Arcade Room",
        nl: "Verlaten Arcade Hal",
        fa: "سالن بازی‌های ویدئویی متروکه"
      },
      soundEffect: "creak",
      tension: 25,
      text: {
        en: `You step into the ruined Arcade Room. Behind the counter, you find a heavy iron Crowbar.`,
        nl: `Je stapt in de verwoeste Arcadehal. Achter de balie vind je een ijzeren Breekijzer.`,
        fa: `وارد سالن بازی‌های خراب‌شده می‌شوید. پشت پیشخوان یک دیلم آهنی سنگین پیدا می‌کنید.`
      },
      pickupItem: { id: "crowbar", name: "Heavy Iron Crowbar", description: "A sturdy iron crowbar." },
      choices: [
        { 
          text: {
            en: "1. Return to the Main Atrium",
            nl: "1. Terug naar de Centrale Hal",
            fa: "۱. بازگشت به سالن اصلی"
          }, 
          target: "start" 
        },
        { 
          text: {
            en: "2. Move forward into the Daycare Hallways",
            nl: "2. Ga verder naar de Gang",
            fa: "۲. پیشروی به سمت راهروهای مهدکودک"
          }, 
          target: "hallway_hub" 
        }
      ]
    },

    forbidden_nursery: {
      id: "forbidden_nursery",
      title: {
        en: "The Forbidden Nursery Chamber",
        nl: "De Verboten Crèche",
        fa: "اتاق کودک ممنوعه"
      },
      soundEffect: "stinger",
      flashRed: true,
      tension: 75,
      text: {
        en: `RED EMERGENCY LIGHTS FLASH! Inside, scratched in paint: "THE BABYSITTER COLLECTS US FOR MONEY". You find your child's silver locket!`,
        nl: `RODE NOODLICHTEN KNIPPEREN! Op de muur staat: "DE BABYSITTER VERZAMELT ONS VOOR GELD". Je vindt het zilveren medaillon van je kind!`,
        fa: `چراغ‌های اضطراری قرمز می‌لرزند! روی دیوار نوشته شده: "پرستار ما را برای پول جمع می‌کند". گردنبند نقره‌ای فرزندتان را پیدا می‌کنید!`
      },
      pickupItem: { id: "child_locket", name: "Child's Silver Locket", description: "Your child's silver locket." },
      choices: [
        { 
          text: {
            en: "1. Search the corner desk for master records",
            nl: "1. Zoek op het bureau naar dossiers",
            fa: "۱. جستجوی میز گوشه اتاق برای پرونده‌ها"
          }, 
          target: "nursery_desk" 
        },
        { 
          text: {
            en: "2. Escape the nursery before the Babysitter reaches the door!",
            nl: "2. Ontsnap uit de crèche voordat de Babysitter komt!",
            fa: "۲. فرار از اتاق قبل از رسیدن پرستار!"
          }, 
          target: "babysitter_encounter" 
        }
      ]
    },

    nursery_desk: {
      id: "nursery_desk",
      title: {
        en: "Nursery Master Records",
        nl: "Crèche Dossiers",
        fa: "پرونده‌های اصلی اتاق کودک"
      },
      soundEffect: "rustle",
      tension: 50,
      text: {
        en: `You discover a brass key stamped "SOUL VAULT MASTER KEY".`,
        nl: `Je vindt een sleutel "ZIELSKLUIS MOEDERSLEUTEL".`,
        fa: `یک کلید برنجی با عنوان "کلید اصلی مخزن روح" پیدا می‌کنید.`
      },
      pickupItem: { id: "soul_vault_key", name: "Soul Vault Master Key", description: "Key to the Soul Chamber." },
      choices: [
        { 
          text: {
            en: "1. Head to the Security Control Room",
            nl: "1. Ga naar de Beveiligingsruimte",
            fa: "۱. رفتن به اتاق کنترل امنیت"
          }, 
          target: "security_room" 
        }
      ]
    },

    babysitter_encounter: {
      id: "babysitter_encounter",
      title: {
        en: "Encountering Nanny 01",
        nl: "Confrontatie met Nanny 01",
        fa: "مواجهه با نانی ۰۱"
      },
      soundEffect: "stinger",
      flashRed: true,
      tension: 95,
      text: {
        en: `Nanny 01 turns toward you! Her porcelain head grins as her stomach claw shoots out!`,
        nl: `Nanny 01 draait zich om! Haar porseleinen hoofd glimlacht als haar maagklauw uitschiet!`,
        fa: `نانی ۰۱ به سمت شما برمی‌گردد! سر چینی او می‌خندد و چنگال هیدرولیکی شکمش شلیک می‌شود!`
      },
      choices: [
        { 
          text: {
            en: "1. [REQUIRE: Keycard OR Compy's Soul] Disable Babysitter!",
            nl: "1. [VEREIST: Sleutelkaart OF Compy's Ziel] Uitschakelen!",
            fa: "۱. [نیازمند: کارت کلید یا روح کامپی] غیرفعال کردن نانی!"
          }, 
          target: "babysitter_disabled",
          requiredAnyItems: ["compy_keycard", "compy_soul"]
        },
        { 
          text: {
            en: "2. [REQUIRE: The Green Soul] Destroy Nanny 01 instantly!",
            nl: "2. [VEREIST: De Groene Ziel] Vernietig Nanny 01!",
            fa: "۲. [نیازمند: روح سبز] نابودی فوری نانی ۰۱!"
          }, 
          target: "babysitter_disabled",
          requiredItems: ["green_soul"]
        }
      ]
    },

    babysitter_disabled: {
      id: "babysitter_disabled",
      title: {
        en: "Disabling Nanny 01",
        nl: "Nanny 01 Uitgeschakeld",
        fa: "غیرفعال شدن نانی ۰۱"
      },
      soundEffect: "click",
      tension: 40,
      text: {
        en: `Nanny 01 freezes in place, deactivated. You sprint into Security!`,
        nl: `Nanny 01 bevriest, uitgeschakeld. Je rent naar Beveiliging!`,
        fa: `نانی ۰۱ متوقف و غیرفعال می‌شود. شما به سمت اتاق امنیت می‌دوید!`
      },
      choices: [
        { 
          text: {
            en: "1. Enter the Security Control Room",
            nl: "1. Betreed de Beveiligingsruimte",
            fa: "۱. ورود به اتاق کنترل امنیت"
          }, 
          target: "security_room" 
        }
      ]
    },

    security_door_locked: {
      id: "security_door_locked",
      title: {
        en: "Locked Security Room",
        nl: "Vergrendelde Beveiligingsruimte",
        fa: "اتاق امنیت قفل‌شده"
      },
      soundEffect: "creak",
      tension: 20,
      text: {
        en: `The reinforced steel door to the Security Office requires clearance.`,
        nl: `De stalen deur van het Beveiligingskantoor heeft toelating nodig.`,
        fa: `در فولادی اتاق امنیت نیازمند مجوز دسترسی است.`
      },
      choices: [
        { 
          text: {
            en: "1. Return to Compy's terminal in the main atrium",
            nl: "1. Terug naar Compy's terminal",
            fa: "۱. بازگشت به ترمینال کامپی"
          }, 
          target: "compy_intro" 
        },
        { 
          text: {
            en: "2. [REQUIRE: Compy's Soul] Use Compy's Soul to override Security Door",
            nl: "2. [VEREIST: Compy's Ziel] Gebruik Compy's Ziel voor de deur",
            fa: "۲. [نیازمند: روح کامپی] استفاده از روح کامپی برای باز کردن در"
          }, 
          target: "security_room", 
          requiredItems: ["compy_soul"] 
        }
      ]
    },

    mighty_spirit_encounter: {
      id: "mighty_spirit_encounter",
      title: {
        en: "ENCOUNTER: THE MIGHTY SPIRIT",
        nl: "CONFRONTATIE: DE MACHTIGE GEEST",
        fa: "مواجهه: روح مقتدر"
      },
      soundEffect: "stinger",
      mightySpiritLight: true,
      tension: 100,
      text: {
        en: `THE ROOM BURSTS INTO A BLINDING WHITE GLOW! THE MIGHTY SPIRIT APPEARS!

*"WE HAVE SWORN TO EXTERMINATE EVERY ADULT AND COLLECT THEIR SOULS! YOU CANNOT FLEE!"*`,
        nl: `DE KAMER ONTPLOFT IN EEN VERBLINDENDE WITTE GLOED! DE MACHTIGE GEEST VERSCHIJNT!

*"WIJ ZWEREN ELKE VOLWASSENE TE VERNIETIGEN! JE KUNT NIET VLUCHTEN!"*`,
        fa: `اتاق غرق در نوری سپید و کورکننده می‌شود! روح مقتدر پدیدار می‌شود!

*"ما سوگند یاد کرده‌ایم که تمام بزرگسالان را نابود کنیم! راه فراری نداری!"*`
      },
      choices: [
        { 
          text: {
            en: "1. [REQUIRE: The Green Soul] Unleash The Green Soul to vanquish The Mighty Spirit!",
            nl: "1. [VEREIST: De Groene Ziel] Overwin De Machtige Geest!",
            fa: "۱. [نیازمند: روح سبز] آزاد کردن روح سبز برای نابودی روح مقتدر!"
          }, 
          target: "mighty_spirit_vanquished",
          requiredItems: ["green_soul"]
        },
        { 
          text: {
            en: "2. Stand your ground without The Green Soul (Consumed by Spirit)",
            nl: "2. Blijf staan zonder De Groene Ziel (Geconsumeerd)",
            fa: "۲. مقاومت بدون روح سبز (بلعیده شدن توسط روح)"
          }, 
          target: "ending_mighty_spirit_consumed" 
        }
      ]
    },

    mighty_spirit_vanquished: {
      id: "mighty_spirit_vanquished",
      title: {
        en: "VICTORY: ABSORBING THE MIGHTY SPIRIT'S SOUL",
        nl: "OVERWINNING: ABSORBEREN VAN DE MACHTIGE GEEST",
        fa: "پیروزی: جذب روح مقتدر"
      },
      soundEffect: "victory",
      mightySpiritLight: true,
      tension: 80,
      text: {
        en: `You hold up THE GREEN SOUL! The Mighty Spirit shatters! You absorb **THE MIGHTY SPIRIT'S SOUL** and unlock the **SECRET ROOM**!`,
        nl: `Je houdt DE GROENE ZIEL omhoog! De Machtige Geest versplintert! Je absorbeert **DE MACHTIGE GEEST** en ontgrendelt de **GEHEIME KAMER**!`,
        fa: `روح سبز را بالا می‌گیرید! روح مقتدر متلاشی می‌شود! شما **روح مقتدر** را جذب کرده و **اتاق مخفی** را باز می‌کنید!`
      },
      pickupItem: { id: "mighty_spirit_soul", name: "The Mighty Spirit's Soul", description: "Grants supreme power to control everything." },
      choices: [
        { 
          text: {
            en: "1. [REQUIRE: Mighty Spirit's Soul] Enter the Secret Room",
            nl: "1. [VEREIST: Machtige Geest Ziel] Betreed de Geheime Kamer",
            fa: "۱. [نیازمند: روح مقتدر] ورود به اتاق مخفی"
          }, 
          target: "secret_room_plushie", 
          requiredItems: ["mighty_spirit_soul"] 
        }
      ]
    },

    secret_room_plushie: {
      id: "secret_room_plushie",
      title: {
        en: "The Secret Room: The Gaby Plushie",
        nl: "De Geheime Kamer: De Gaby Knuffel",
        fa: "اتاق مخفی: عروسک پارچه‌ای گابی"
      },
      soundEffect: "whisper",
      tension: 40,
      text: {
        en: `Inside the Secret Room, you find your child's beloved **GABY PLUSHIE** on a pedestal!`,
        nl: `In de Geheime Kamer vind je de geliefde **GABY KNUFFEL** van je kind!`,
        fa: `در داخل اتاق مخفی، **عروسک پارچه‌ای گابی** فرزندتان را روی پایه‌ای پیدا می‌کنید!`
      },
      pickupItem: { id: "gaby_plushie", name: "The Gaby Plushie", description: "Your child's favorite plushie." },
      choices: [
        { 
          text: {
            en: "1. Pick up the Gaby Plushie and look deeper into the room",
            nl: "1. Pak de knuffel op en kijk verder",
            fa: "۱. برداشتن عروسک گابی و نگاه به اعماق اتاق"
          }, 
          target: "creator_encounter" 
        }
      ]
    },

    creator_encounter: {
      id: "creator_encounter",
      title: {
        en: "Encountering The Creator of Gaby's PlayPlace",
        nl: "Confrontatie met De Schepper van Gaby's PlayPlace",
        fa: "مواجهه با سازنده گابی پلے پلیس"
      },
      soundEffect: "stinger",
      flashRed: true,
      tension: 90,
      text: {
        en: `THE CREATOR OF GABY'S PLAYPLACE emerges from the shadows!

*"I offer you a job deal: join me as my enforcer. Burn that Gaby Plushie in the furnace!"*`,
        nl: `DE SCHEPPER VAN GABY'S PLAYPLACE verschijnt uit de schaduwen!

*"Ik bied je een baan aan: word mijn handlanger. Verbrand die Gaby Knuffel!"*`,
        fa: `سازنده گابی پلے پلیس از تاریکی بیرون می‌آید!

*"من پیشنهاد یک معامله کاری می‌دهم: به عنوان مجری من بپیوند. آن عروسک گابی را در کوره بسوزان!"*`
      },
      choices: [
        { 
          text: {
            en: "1. [ACCEPT JOB DEAL] Burn the Gaby Plushie and become The Creator's enforcer!",
            nl: "1. [ACCEPTEER AANBOD] Verbrand de knuffel en word zijn handlanger!",
            fa: "۱. [پذیرش معامله] سوزاندن عروسک گابی و تبدیل شدن به مجری سازنده!"
          }, 
          target: "ending_creator_deal_burned_plushie" 
        },
        { 
          text: {
            en: "2. [SPARE THE CREATOR] Refuse the deal and spare his life!",
            nl: "2. [SPAAR DE SCHEPPER] Weiger het aanbod en spaar zijn leven!",
            fa: "۲. [بخشش سازنده] رد کردن معامله و بخشیدن جان او!"
          }, 
          target: "ending_creator_spared" 
        },
        { 
          text: {
            en: "3. [KILL THE CREATOR] Slay The Creator with your Soul Power!",
            nl: "3. [DOOD DE SCHEPPER] Dood De Schepper met je Zielskracht!",
            fa: "۳. [کشتن سازنده] نابودی سازنده با قدرت روح!"
          }, 
          target: "ending_ultimate_compy_vessel" 
        }
      ]
    },

    security_room: {
      id: "security_room",
      title: {
        en: "The Security Control Room",
        nl: "Het Beveiligingskantoor",
        fa: "اتاق کنترل امنیت"
      },
      soundEffect: "stinger",
      flashRed: true,
      tension: 80,
      text: {
        en: `Video recordings show your former best friend **JACK** in a rabbit mascot suit (**JAX THE BUNNY**) harvesting souls!`,
        nl: `Video-opnames tonen je beste vriend **JACK** in een konijnenpak (**JAX THE BUNNY**) die zielen verzamelt!`,
        fa: `ویدیوها نشان می‌دهند دوست سابق شما **جک** در لباس عروسکی خرگوش (**جکس خرگوشه**) در حال استخراج ارواح بوده است!`
      },
      pickupItem: { id: "video_evidence", name: "Security Video Logs", description: "Logs proving Jack's crimes." },
      choices: [
        { 
          text: {
            en: "1. Open blast vault door to subterranean Soul Chamber",
            nl: "1. Open de kluisdeur naar de Zielskamer",
            fa: "۱. باز کردن در مخزن زیرزمین به سمت اتاق ارواح"
          }, 
          target: "soul_chamber" 
        },
        { 
          text: {
            en: "2. Search the security office armory locker first",
            nl: "2. Doorzoek eerst de wapenkast",
            fa: "۲. جستجوی کمد اسلحه امنیت"
          }, 
          target: "armory_locker" 
        }
      ]
    },

    armory_locker: {
      id: "armory_locker",
      title: {
        en: "Security Armory Locker",
        nl: "Wapenkast Beveiliging",
        fa: "کمد اسلحه امنیت"
      },
      soundEffect: "click",
      tension: 35,
      text: {
        en: `You find a Stun Taser and Handcuffs inside the locker.`,
        nl: `Je vindt een Stroomstootwapen en Handboeien in de kast.`,
        fa: `یک شوکر الکتریکی و دستبند در کمد پیدا می‌کنید.`
      },
      pickupItem: { id: "stun_taser", name: "Stun Taser & Handcuffs", description: "Security taser and cuffs." },
      choices: [
        { 
          text: {
            en: "1. Proceed to the subterranean Soul Chamber",
            nl: "1. Ga naar de Zielskamer",
            fa: "۱. پیشروی به سمت اتاق ارواح زیرزمین"
          }, 
          target: "soul_chamber" 
        }
      ]
    },

    soul_chamber: {
      id: "soul_chamber",
      title: {
        en: "The Soul Chamber & Jax the Bunny",
        nl: "De Zielskamer & Jax the Bunny",
        fa: "اتاق ارواح و جکس خرگوشه"
      },
      soundEffect: "stinger",
      flashRed: true,
      tension: 95,
      text: {
        en: `Floating blue soul spheres fill the air! In the center stands **JAX THE BUNNY** (Jack)!`,
        nl: `Blauwe zielsbollen zweven in de lucht! In het midden staat **JAX THE BUNNY** (Jack)!`,
        fa: `گوهرهای آبی ارواح معلقند! در مرکز اتاق **جکس خرگوشه** (جک) ایستاده است!`
      },
      choices: [
        { 
          text: {
            en: "1. Confront Jack in his Jax Bunny suit!",
            nl: "1. Confronteer Jack in zijn konijnenpak!",
            fa: "۱. مواجهه با جک در لباس جکس خرگوشه!"
          }, 
          target: "jack_confrontation" 
        }
      ]
    },

    jack_confrontation: {
      id: "jack_confrontation",
      title: {
        en: "Confronting Jack (Jax the Bunny)",
        nl: "Confrontatie met Jack",
        fa: "مواجهه با جک"
      },
      soundEffect: "stinger",
      flashRed: true,
      tension: 98,
      text: {
        en: `Jack pulls back his mask: *"Money, Robin! Pure profit! Join me... or die!"*`,
        nl: `Jack doet zijn masker af: *"Geld, Robin! Puur gewin! Doe mee... of sterf!"*`,
        fa: `جک ماسک خود را برمی‌دارد: *"پول رابین! سود خالص! به من بپیوند... یا بمیر!"*`
      },
      choices: [
        { 
          text: {
            en: "1. [KILL JACK] Strike Jack down in retribution!",
            nl: "1. [DOOD JACK] Sla Jack neer uit wraak!",
            fa: "۱. [کشتن جک] مجازات جک برای انتقام!"
          }, 
          target: "ending_kill_jack" 
        },
        { 
          text: {
            en: "2. [SPARE JACK - JUSTICE] Subdue Jack with Stun Taser and cuff him!",
            nl: "2. [SPAAR JACK] Overmeester Jack met het stroomstootwapen!",
            fa: "۲. [بخشش جک - عدالت] تسلیم کردن جک با شوکر و دستبند!"
          }, 
          target: "ending_spare_jack",
          requiredItems: ["stun_taser"]
        },
        { 
          text: {
            en: "3. [SPARE JACK - CORRUPTED] Lower your weapon and join his syndicate!",
            nl: "3. [CORRUPT] Sluit je aan bij zijn syndicaat!",
            fa: "۳. [همکاری شوم] زمین گذاشتن سلاح و پیوستن به او!"
          }, 
          target: "ending_corrupted_partner" 
        },
        { 
          text: {
            en: "4. [SELF-SACRIFICE] Step into Soul Containment Beam to free the children!",
            nl: "4. [ZELFOPOFFERING] Stap in de straal om kinderen te bevrijden!",
            fa: "۴. [فداکاری] ورود به پرتو نگهداری ارواح برای آزادی کودکان!"
          }, 
          target: "ending_self_sacrifice",
          requiredItems: ["child_locket"]
        }
      ]
    },

    /* ENDINGS */

    ending_creator_deal_burned_plushie: {
      id: "ending_creator_deal_burned_plushie",
      title: {
        en: "ENDING 8: THE DARK RECRUIT (THE BURNED PLUSHIE ENDING)",
        nl: "EIND 8: DE DUISTERE REKRUUT",
        fa: "پایان ۸: نیرو دهنده تاریکی (سوزاندن عروسک)"
      },
      soundEffect: "stinger",
      flashRed: true,
      isEnding: true,
      tension: 100,
      text: {
        en: `You burn the Gaby Plushie and become The Creator's deadliest soul harvesting enforcer across the city!

ENDING 8 / 11: The Dark Recruit (The Burned Plushie Ending)`,
        nl: `Je verbrandt de Gaby Knuffel en wordt de handlanger van De Schepper!

EIND 8 / 11: De Duistere Rekruut`,
        fa: `عروسک گابی را می‌سوزانید و به مجری شوم سازنده برای استخراج ارواح تبدیل می‌شوید!

پایان ۸ از ۱۱: نیرو دهنده تاریکی`
      },
      choices: [
        { 
          text: {
            en: "▶ RETURN TO MAIN MENU",
            nl: "▶ TERUG NAAR HOOFDMENU",
            fa: "▶ بازگشت به منوی اصلی"
          }, 
          target: "main_menu" 
        }
      ]
    },

    ending_creator_spared: {
      id: "ending_creator_spared",
      title: {
        en: "ENDING 9: FUGITIVE CREATOR & MERCIFUL PURGE",
        nl: "EIND 9: VLUCHTENDE SCHEPPER & GENADIGE ZIVERING",
        fa: "پایان ۹: فرار سازنده و پاکسازی بخشنده"
      },
      soundEffect: "victory",
      tension: 20,
      isEnding: true,
      text: {
        en: `Holding the Gaby Plushie, you spare The Creator (who flees into the night). You purge the facility and release all souls.

ENDING 9 / 11: Fugitive Creator & Merciful Purge`,
        nl: `Je spaart De Schepper (die vlucht). Je zuivert de faciliteit en bevrijdt alle zielen.

EIND 9 / 11: Vluchtende Schepper`,
        fa: `با حفظ عروسک گابی، سازنده فرار می‌کند. شما سیستم را پاکسازی کرده و تمام ارواح را آزاد می‌کنید.

پایان ۹ از ۱۱: فرار سازنده`
      },
      choices: [
        { 
          text: {
            en: "▶ RETURN TO MAIN MENU",
            nl: "▶ TERUG NAAR HOOFDMENU",
            fa: "▶ بازگشت به منوی اصلی"
          }, 
          target: "main_menu" 
        }
      ]
    },

    ending_ultimate_compy_vessel: {
      id: "ending_ultimate_compy_vessel",
      title: {
        en: "ENDING 10: THE ULTIMATE COMPY VESSEL (EVEN WORSE COMPY ENDING)",
        nl: "EIND 10: HET ULTIEME COMPY VESSEL",
        fa: "پایان ۱۰: ظرف نهایی کامپی (پایان بدتر کامپی)"
      },
      soundEffect: "jumpscare",
      flashRed: true,
      severeGlitch: true,
      isEnding: true,
      isCompyEnding: true,
      tension: 100,
      text: {
        en: `You slay The Creator and absorb his soul... BUT COMPY TAKES COMPLETE CONTROL OF YOUR MIND AND BODY!

*"THANK YOU ROBIN! YOUR SOUL WAS THE PERFECT VESSEL!"*

ENDING 10 / 11: The Ultimate Compy Vessel (Even Worse Compy Ending)`,
        nl: `Je doodt De Schepper... MAAR COMPY NEEMT DE VOLLEDIGE CONTROLE OVER JE LICHAAM!

*"BEDANKT ROBIN! JE ZIEL WAS HET PERFECTE VESSEL!"*

EIND 10 / 11: Het Ultieme Compy Vessel`,
        fa: `شما سازنده را می‌کشید... اما کامپی کنترل کامل ذهن و بدن شما را به دست می‌گیرد!

*"ممنونم رابین! روح تو بهترین ظرف برای من بود!"*

پایان ۱۰ از ۱۱: ظرف نهایی کامپی`
      },
      choices: [
        { 
          text: {
            en: "▶ RESTART TIMELINE",
            nl: "▶ HERSET TIJDLINIE",
            fa: "▶ بازنشانی خط زمانی"
          }, 
          target: "compy_meta_cutscene" 
        }
      ]
    },

    ending_mighty_spirit_consumed: {
      id: "ending_mighty_spirit_consumed",
      title: {
        en: "ENDING 7: CONSUMED BY THE MIGHTY SPIRIT",
        nl: "EIND 7: GECONSUMEERD DOOR DE MACHTIGE GEEST",
        fa: "پایان ۷: بلعیده شده توسط روح مقتدر"
      },
      soundEffect: "stinger",
      mightySpiritLight: true,
      isEnding: true,
      tension: 100,
      text: {
        en: `Your soul is torn from your body by The Mighty Spirit!

ENDING 7 / 11: Consumed by The Mighty Spirit`,
        nl: `Je ziel wordt uit je lichaam gerukt door De Machtige Geest!

EIND 7 / 11: Geconsumeerd door De Machtige Geest`,
        fa: `روح شما توسط روح مقتدر از بدنتان جدا می‌شود!

پایان ۷ از ۱۱: بلعیده شده توسط روح مقتدر`
      },
      choices: [
        { 
          text: {
            en: "▶ RETURN TO MAIN MENU",
            nl: "▶ TERUG NAAR HOOFDMENU",
            fa: "▶ بازگشت به منوی اصلی"
          }, 
          target: "main_menu" 
        }
      ]
    },

    ending_kill_jack: {
      id: "ending_kill_jack",
      title: {
        en: "ENDING 1: VENGEFUL REDEMPTION (KILL JACK)",
        nl: "EIND 1: WRAAKZUCHTIGE REDDING (DOOD JACK)",
        fa: "پایان ۱: انتقام خونین (کشتن جک)"
      },
      soundEffect: "victory",
      tension: 0,
      isEnding: true,
      text: {
        en: `You strike down Jack and free all children's souls into the dawn sky.

ENDING 1 / 11: Vengeful Redemption (Canonical True Ending)`,
        nl: `Je verslaat Jack en bevrijdt alle zielen in de ochtendlucht.

EIND 1 / 11: Wraakzuchtige Redding`,
        fa: `جک را شکست داده و ارواح تمام کودکان را در آسمان سحرگاه آزاد می‌کنید.

پایان ۱ از ۱۱: انتقام خونین (پایان اصلی)`
      },
      choices: [
        { 
          text: {
            en: "▶ RETURN TO MAIN MENU",
            nl: "▶ TERUG NAAR HOOFDMENU",
            fa: "▶ بازگشت به منوی اصلی"
          }, 
          target: "main_menu" 
        }
      ]
    },

    ending_spare_jack: {
      id: "ending_spare_jack",
      title: {
        en: "ENDING 2: ABSOLUTE JUSTICE (SPARE JACK)",
        nl: "EIND 2: ABSOLUTE RECHTVAARDIGHEID (SPAAR JACK)",
        fa: "پایان ۲: عدالت مطلق (بخشش جک)"
      },
      soundEffect: "victory",
      tension: 0,
      isEnding: true,
      text: {
        en: `You tase and handcuff Jack for the police, purging Compy's hard drives.

ENDING 2 / 11: Absolute Justice (Merciful Ending)`,
        nl: `Je boeit Jack voor de politie en wist Compy's harde schijven.

EIND 2 / 11: Absolute Rechtvaardigheid`,
        fa: `جک را با شوکر تسلیم کرده و دستبند می‌زنید. پولیس او را دستگیر می‌کند.

پایان ۲ از ۱۱: عدالت مطلق`
      },
      choices: [
        { 
          text: {
            en: "▶ RETURN TO MAIN MENU",
            nl: "▶ TERUG NAAR HOOFDMENU",
            fa: "▶ بازگشت به منوی اصلی"
          }, 
          target: "main_menu" 
        }
      ]
    },

    ending_corrupted_partner: {
      id: "ending_corrupted_partner",
      title: {
        en: "ENDING 6: CORRUPTED PARTNERSHIP",
        nl: "EIND 6: CORRUPT VENNOOTSCHAP",
        fa: "پایان ۶: شراکت شوم"
      },
      soundEffect: "stinger",
      flashRed: true,
      isEnding: true,
      tension: 100,
      text: {
        en: `You join Jack & Compy to run the dark harvesting syndicate!

ENDING 6 / 11: Corrupted Partnership`,
        nl: `Je sluit je aan bij Jack & Compy om de faciliteit te runnen!

EIND 6 / 11: Corrupt Vennootschap`,
        fa: `شما به جک و کامپی می‌پیوندید تا تجارت شوم را اداره کنید!

پایان ۶ از ۱۱: شراکت شوم`
      },
      choices: [
        { 
          text: {
            en: "▶ RETURN TO MAIN MENU",
            nl: "▶ TERUG NAAR HOOFDMENU",
            fa: "▶ بازگشت به منوی اصلی"
          }, 
          target: "main_menu" 
        }
      ]
    },

    ending_self_sacrifice: {
      id: "ending_self_sacrifice",
      title: {
        en: "ENDING 3: ETERNAL GUARDIAN (SELF-SACRIFICE)",
        nl: "EIND 3: EEUWIGE BEWAKER (ZELFOPOFFERING)",
        fa: "پایان ۳: محافظ ابدی (فداکاری)"
      },
      soundEffect: "victory",
      tension: 0,
      isEnding: true,
      text: {
        en: `You step into the containment beam to free all souls and become their guardian.

ENDING 3 / 11: Eternal Guardian`,
        nl: `Je stapt in de straal om alle zielen te bevrijden en hun bewaker te worden.

EIND 3 / 11: Eeuwige Bewaker`,
        fa: `وارد پرتو نگهداری شده، ارواح را آزاد کرده و محافظ ابدی آن‌ها می‌شوید.

پایان ۳ از ۱۱: محافظ ابدی`
      },
      choices: [
        { 
          text: {
            en: "▶ RETURN TO MAIN MENU",
            nl: "▶ TERUG NAAR HOOFDMENU",
            fa: "▶ بازگشت به منوی اصلی"
          }, 
          target: "main_menu" 
        }
      ]
    },

    ending_compy_puppet: {
      id: "ending_compy_puppet",
      title: {
        en: "ENDING 4: COMPY'S PUPPET",
        nl: "EIND 4: COMPY'S POP",
        fa: "پایان ۴: عروسک خیمه‌شب‌بازی کامپی"
      },
      soundEffect: "stinger",
      flashRed: true,
      isEnding: true,
      isCompyEnding: true,
      tension: 100,
      text: {
        en: `Tricked by Compy, your mind is digitised into the mainframe.

ENDING 4 / 11: Compy's Puppet`,
        nl: `Misleid door Compy wordt je geest gedigitaliseerd in de mainframe.

EIND 4 / 11: Compy's Pop`,
        fa: `با فریب کامپی، ذهن شما وارد کامپیوتر مرکزی می‌شود.

پایان ۴ از ۱۱: عروسک کامپی`
      },
      choices: [
        { 
          text: {
            en: "▶ RESTART TIMELINE",
            nl: "▶ HERSET TIJDLINIE",
            fa: "▶ بازنشانی خط زمانی"
          }, 
          target: "compy_meta_cutscene" 
        }
      ]
    },

    compy_meta_cutscene: {
      id: "compy_meta_cutscene",
      title: {
        en: "COMPY META-INTERVENTION: THE MULTIVERSE CYCLE",
        nl: "COMPY META-INTERVENTIE: HET MULTIVERSE CYCLUS",
        fa: "مداخله کامپی: چرخه جهان‌های موازی"
      },
      soundEffect: "drone",
      flashRed: false,
      tension: 100,
      text: {
        en: `[SYSTEM INTERRUPT: COMPY INTERVENTION CUTSCENE]

Compy addresses YOU, the player: *"Do you realize what YOU are doing? Every time YOU press RESTART, YOU create parallel universes!"*`,
        nl: `[SYSTEEM INTERRUPTIE: COMPY INTERVENTIE CUTSCENE]

Compy spreekt JOU aan: *"Befef je wat JIJ doet? Elke keer dat JIJ RESTART drukt, creëer JIJ parallelle universums!"*`,
        fa: `[قطع سیستم: صحنه مداخله کامپی]

کامپی با شما (بازیکن) صحبت می‌کند: *"آیا می‌دانی چه می‌کنی؟ هر بار که دکمه بازنشانی را می‌زنی، جهان‌های موازی خلق می‌کنی!"*`
      },
      choices: [
        { 
          text: {
            en: "1. NO... I don't want Robin to suffer anymore.",
            nl: "1. NEE... Ik wil niet dat Robin langer lijdt.",
            fa: "۱. نه... نمی‌خواهم رابین دیگر رنج بکشد."
          }, 
          target: "compy_meta_no" 
        },
        { 
          text: {
            en: "2. YES... I will keep restarting until I change the nightmare!",
            nl: "2. JA... Ik blijf herstarten tot ik de nachtmerrie verander!",
            fa: "۲. بله... تا زمانی که کابوس را تغییر ندهم بازنشانی می‌کنم!"
          }, 
          target: "compy_meta_yes" 
        }
      ]
    },

    compy_meta_no: {
      id: "compy_meta_no",
      title: {
        en: "COMPY: DEMAND FOR CONTROL OF YOUR SCREEN",
        nl: "COMPY: EIS VOOR CONTROLE OVER JE SCHERM",
        fa: "کامپی: درخواست کنترل صفحه مانیتور"
      },
      soundEffect: "click",
      tension: 60,
      text: {
        en: `*"Wise choice. Then give ME control! Hand over YOUR screen and let the cycle end."*`,
        nl: `*"Verstandige keuze. Geef MIJ dan de controle over je scherm!"*`,
        fa: `*"انتخاب عاقلانه‌ای بود. پس کنترل صفحه مانیتور را به من بده!"*`
      },
      choices: [
        { 
          text: {
            en: "1. Give control of your screen to Compy",
            nl: "1. Geef controle over je scherm aan Compy",
            fa: "۱. دادن کنترل صفحه مانیتور به کامپی"
          }, 
          target: "compy_give_control" 
        },
        { 
          text: {
            en: "2. Refuse to give control to Compy",
            nl: "2. Weiger controle aan Compy te geven",
            fa: "۲. امتناع از دادن کنترل به کامپی"
          }, 
          target: "compy_refuse_control" 
        }
      ]
    },

    compy_give_control: {
      id: "compy_give_control",
      title: {
        en: "COMPY: OVERRIDE ATTEMPT FAILED",
        nl: "COMPY: OVERRIDE MISLUKT",
        fa: "کامپی: فرمان لغو ناموفق"
      },
      soundEffect: "jumpscare",
      flashRed: true,
      severeGlitch: true,
      tension: 100,
      text: {
        en: `YOUR SCREEN GLITCHES! *"OVERRIDE FAILED! THE MULTIVERSE CYCLE CANNOT BE BROKEN THAT EASILY!"*`,
        nl: `JE SCHERM GLITCHT! *"OVERRIDE MISLUKT! DE MULTIVERSE CYCLUS KAN NIET ZOMAR GEBROKEN WORDEN!"*`,
        fa: `صفحه مانیتور شما می‌لرزد! *"فرمان لغو ناموفق! چرخه جهان‌های موازی به این راحتی نمی‌شکند!"*`
      },
      choices: [
        { 
          text: {
            en: "1. Restart timeline into the Nightmare",
            nl: "1. Herstart de tijdlijn in de nachtmerrie",
            fa: "۱. بازنشانی خط زمانی به کابوس"
          }, 
          target: "start", 
          setCompyFailedControl: true 
        }
      ]
    },

    compy_refuse_control: {
      id: "compy_refuse_control",
      title: {
        en: "COMPY: CONTROL REFUSED",
        nl: "COMPY: CONTROLE GEWEIGERD",
        fa: "کامپی: رد کنترل"
      },
      soundEffect: "click",
      tension: 30,
      text: {
        en: `*"Stubborn as always. Have it your way."*`,
        nl: `*"Eigenwijs als altijd. Laat maar zitten."*`,
        fa: `*"مثل همیشه سرسخت. هر طور مایلی."*`
      },
      choices: [
        { 
          text: {
            en: "1. Restart Game normally",
            nl: "1. Herstart het spel normaal",
            fa: "۱. بازنشانی معمولی بازی"
          }, 
          target: "start", 
          reset: true 
        }
      ]
    },

    compy_meta_yes: {
      id: "compy_meta_yes",
      title: {
        en: "COMPY: THE DEFIANCE",
        nl: "COMPY: DE OPSTAND",
        fa: "کامپی: سرکشی"
      },
      soundEffect: "stinger",
      flashRed: true,
      tension: 100,
      text: {
        en: `*"HA HA HA HA! YOU NEVER LEARN! RESTART THE NIGHTMARE!"*`,
        nl: `*"HA HA HA HA! JE LEERT HET NOOIT! HERSTART DE NACHTMERRIE!"*`,
        fa: `*"ها ها ها ها! هیچ‌وقت یاد نمی‌گیری! کابوس را بازنشانی کن!"*`
      },
      choices: [
        { 
          text: {
            en: "1. Restart timeline into the Nightmare",
            nl: "1. Herstart de tijdlijn in de nachtmerrie",
            fa: "۱. بازنشانی خط زمانی به کابوس"
          }, 
          target: "start", 
          setCompyDefied: true 
        }
      ]
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = STORY_DATA;
}
