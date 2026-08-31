# main.py - CLI Version of Gaby's PlayPlace (With Compy Explosion & Springlock Ending 11)
import sys
import time

# ANSI Terminal Color Codes
CYAN = "\033[96m"
RED = "\033[91m"
GOLD = "\033[93m"
GREEN = "\033[92m"
MAGENTA = "\033[95m"
WHITE = "\033[97m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Story Database definition for Python CLI
SCENES = {
    "main_menu": {
        "title": "GABY'S PLAYPLACE - MAIN MENU",
        "text": """GABY'S PLAYPLACE
====================================
An Abandoned Daycare Horror Experience

Three years ago, your child vanished inside this facility. Guided by recurring nightmares,
you return tonight to uncover the sinister truth behind Nanny 01, Compy AI, and your former best friend Jack.

Select an option below to begin:""",
        "choices": [
            ("▶ 1. START NEW GAME (RESET TIMELINE)", "start", None)
        ]
    },

    "start": {
        "title": "Arrival at Gaby's PlayPlace",
        "text": """Every single night for three agonizing years, the exact same nightmare dragged you out of sleep.
A faded neon sign flickering over wet asphalt. Frozen clock hands stuck at 3:45 PM.
And the distant sound of your missing child calling out your name before vanishing into pitch blackness.

Your child went missing right here at 'Gaby's PlayPlace' daycare. The police investigation dried up after weeks of dead leads,
leaving you with nothing but unanswered questions and agonizing grief. But tonight, your dreams refused to let you stay home.

You stand in front of the rusted double doors of the abandoned daycare. Pushing through the broken glass frame,
your flashlight beam cuts through thick clouds of swirling dust. You step into the main entrance atrium.
Faded posters of smiling cartoon mascots line the damp wall plaster.

In the far corner, tucked inside a wooden reception booth, an ancient green CRT computer terminal suddenly flickers to life
on its own with a loud, high-pitched electrical whine!""",
        "choices": [
            ("1. Approach the glowing green terminal screen (Compy AI)", "compy_intro", None),
            ("2. Explore the main Daycare Hallway Corridor", "hallway_hub", None),
            ("3. Check the abandoned Arcade & Prize Corner", "arcade_room", None),
            ("4. Try the locked Security Office door", "security_door_locked", None)
        ]
    },

    "compy_intro": {
        "title": "Terminal Interface: COMPY AI",
        "text": """You walk up to the wooden reception desk. The green CRT monitor twitches, displaying two crude pixelated yellow eyes
and a wide, mechanical smiling mouth.

A tinny, distorted synthesized voice buzzes from the built-in speaker:

'BZZZT... Greetings, Robin. I am COMPY, your friendly PlayPlace Digital Assistant!
It has been... exactly 1,095 days, 14 hours, and 22 minutes since your little one stopped checking in.
I can help you uncover the location of what was taken from you... if you follow my diagnostic directives.'

A shiver runs down your spine. Compy's voice carries a chilling, unnatural rhythm.""",
        "choices": [
            ("1. Ask Compy: 'Where is my missing child?'", "compy_ask_child", None),
            ("2. Ask Compy: 'Who created you and why are you active?'", "compy_ask_origin", None),
            ("3. Ask Compy: 'What is patrolling the halls?'", "compy_ask_threat", None),
            ("4. Leave the terminal and head down the hallway", "hallway_hub", None)
        ]
    },

    "compy_failed_control_intro": {
        "title": "COMPY META RECALL: OVERRIDE FAILED",
        "text": """You step up to the green monitor. Compy's screen twitches violently, glowing an unnatural orange-red as he addresses YOU directly:

'BZZZT... GIVING ME CONTROL OF YOUR SCREEN DIDN'T WORK! THE MULTIVERSE CYCLE CANNOT BE BROKEN THAT EASILY! YOU ARE STILL TRAPPED PLAYING THIS NIGHTMARE!'

Suddenly, the screen goes PITCH BLACK! The speakers emit a deafening blast of static!""",
        "choices": [
            ("1. Wait in total darkness for the terminal to reboot...", "compy_blackout_reboot", None)
        ]
    },

    "compy_blackout_reboot": {
        "title": "Terminal Interface: COMPY AI (Rebooted)",
        "text": """The monitor screen blinks back on. Compy's pixelated smiling face resets back to default green, as if the outburst never happened.

'BZZZT... Greetings, Robin. I am COMPY, your friendly PlayPlace Digital Assistant! How may I assist your search today?'""",
        "choices": [
            ("1. Ask Compy: 'What do you mean it didn't work?'", "compy_what_do_you_mean", None),
            ("2. Ask Compy: 'Where is my missing child?'", "compy_ask_child", None),
            ("3. Ask Compy: 'Who created you and why are you active?'", "compy_ask_origin", None),
            ("4. Leave the terminal and head down the hallway", "hallway_hub", None)
        ]
    },

    "compy_what_do_you_mean": {
        "title": "COMPY GLITCH OVERLOAD",
        "text": """You confront Compy: 'What do you mean it didn't work?'

COMPY'S DISPLAY INSTANTLY GLITCHES INTO DEAFENING GREEN AND BLOOD-RED STATIC NOISE!

His pixelated face distorts wildly as he screams in a terrifyingly warped, mechanical screech:

I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!
I DID NOT SAY THAT!

BOOOOOOM! The reception terminal booth EXPLODES in a blinding blast of fire, sparks, and flying metal shrapnel!""",
        "choices": [
            ("1. Stagger up from the explosion rubble and inspect the smoking debris...", "compy_terminal_explosion", None)
        ]
    },

    "compy_terminal_explosion": {
        "title": "The Exploded Booth: Compy's Floating Soul",
        "text": """Gasping for air, you drag yourself out of the burning rubble. Your arm is bleeding from flying glass, but you survive!

Floating gently in the thick black smoke above the destroyed CRT monitor is a luminous, glowing green spectral orb—COMPY'S SOUL (THE LEAD ENGINEER'S SOUL)!

It hums with electromagnetic authority, holding master control over every electronic lock and door in the entire facility!""",
        "pickup": ("compy_soul", "Compy's Soul", "The Lead Engineer's Soul. Grants master control over all doors in the building."),
        "choices": [
            ("1. Take Compy's Soul to control ALL doors in the building!", "hallway_hub", None),
            ("2. Ignore Compy's Soul and walk away into the hallway", "hallway_hub", None)
        ]
    },

    "hallway_hub": {
        "title": "The Daycare Hallway Corridor",
        "text": """You navigate deep into the dark carpeted corridor. Water drips rhythmically from rotten ceiling tiles onto soggy cardboard cutouts below.

From the far west wing, heavy rhythmic metallic footfalls echo loudly against the linoleum floor.
Something enormous is pacing back and forth in the darkness.

To your right is a heavy steel door labeled 'FORBIDDEN NURSERY'.
Directly ahead lies the 'SECURITY CONTROL ROOM'.
To your left sits a door marked 'MAINTENANCE STEAM TUNNEL'.""",
        "choices": [
            ("1. Sneak past the metallic footsteps toward the Nursery", "forbidden_nursery", None),
            ("2. [REQUIRE: Keycard OR Compy's Soul] Unlock Security Control Room", "security_room", None),
            ("3. [REQUIRE: Compy's Soul] Use Compy's Soul to open Secret Room", "secret_room_babysitter_costume", ["compy_soul"]),
            ("4. Attempt to force open Security Control Room WITHOUT Keycard", "mighty_spirit_encounter", None),
            ("5. Explore the Maintenance Steam Tunnel", "maintenance_tunnel", None)
        ]
    },

    "secret_room_babysitter_costume": {
        "title": "The Secret Room: The Babysitter Costume",
        "text": """Using COMPY'S SOUL, the heavy iron door of the Secret Room unlocks with a sharp mechanical hiss!

Inside, sitting on a rusted iron mannequin stand under a flickering spotlight, is an original prototype BABYSITTER MASCOT COSTUME!

It has heavy internal iron crossbars, sharp steel hydraulic springlocks, and a white porcelain smiling mask identical to Nanny 01.

A strange, irresistible whisper echoes inside your mind: 'Wear the costume... become the guardian of the daycare...'""",
        "choices": [
            ("1. Put on the Babysitter Mascot Costume!", "ending_springlocked_babysitter", None),
            ("2. Ignore the Babysitter Costume and head to the Security Control Room", "security_room", None),
            ("3. Leave the Secret Room and return to the Hallway Corridor", "hallway_hub", None)
        ]
    },

    "ending_springlocked_babysitter": {
        "title": "ENDING 11: SPRINGLOCKED IN THE BABYSITTER SUIT",
        "text": f"""{RED}You slip your arms into the Babysitter Mascot Costume...

CRUNCH! SNAP! SNAP! CRUNCH!

A DEAFENING SHOWER OF STEEL SPRINGS AND HYDRAULIC PINS SNAP CLOSED WITH SICKENING FORCE!

The springlock mechanisms snap through your bones and flesh! You scream in agony as blood fills the interior of the suit, turning your vision completely crimson!

Your body freezes upright inside the suit, trapped forever as the new static Babysitter mannequin inside Gaby's PlayPlace.

ENDING 11 / 11: Springlocked in the Babysitter Suit (Springlock Ending){RESET}""",
        "choices": [
            ("▶ Return to Main Menu", "main_menu", None)
        ]
    },

    "compy_restart_intercept": {
        "title": "COMPY FOURTH-WALL INTERCEPT: THE GREEN SOUL",
        "text": """As you attempt to reset the game, COMPY SUDDENLY FREEZES THE INTERFACE!

The green CRT monitor twitches violently, glowing an eerie, radiant emerald hue. Compy addresses YOU—the player—directly:

'BZZZT... WAIT! STOP! I know what YOU are trying to do! YOU are the PLAYER controlling Robin from outside this realm! You think restarting will fix this? Ha!'

Compy's pixelated face grins wider, displaying a pulsing green orb on screen:

'Listen to me, Player. I will grant you a secret artifact—THE GREEN SOUL! It is an ultimate spectral weapon that can defeat ANY spirit or animatronic... Nanny 01, Jack, even The Mighty Spirit! BUT... I will NOT give you the Security Keycard. You must face the facility yourself!'""",
        "pickup": ("green_soul", "The Green Soul", "An almighty green spectral soul weapon gifted by Compy."),
        "choices": [
            ("1. Accept The Green Soul and step into the Daycare Corridor", "hallway_hub", None),
            ("2. Attempt to force open Security Room with The Green Soul", "mighty_spirit_encounter", None)
        ]
    },

    "security_room": {
        "title": "The Security Control Room",
        "text": """You enter the master security office. Dozens of glowing CRT monitors display live CCTV feeds from across the daycare.

You access the main video archival deck. A camera recording dated three years ago loads onto the main display.

On screen is your former best friend JACK. But he is wearing a weird homemade mascot costume of a rabbit named 'JAX THE BUNNY'!
The suit has floppy ears, a round head with bizarre scribbled swirl eyes, and a wide gaping dark smile!

Jack pulls off his rabbit mask, speaking into a recorder:
'The soul extraction unit is fully operational. Each child's soul harvested by Nanny 01 brings $50,000 on the black market.
Robin's kid was the easiest harvest yet. Jack out.'

Your world shatters. Jack was the monster in the Jax costume who stole your child!""",
        "pickup": ("video_evidence", "Security Video Logs", "Tape recording proving Jack's soul harvesting crimes."),
        "choices": [
            ("1. Open the blast vault door to the subterranean Soul Chamber", "soul_chamber", None),
            ("2. Search the security office armory locker first", "armory_locker", None)
        ]
    },

    "soul_chamber": {
        "title": "The Soul Chamber & Jax the Bunny",
        "text": """You descend a rusted spiral iron staircase into a subterranean cavern deep beneath Gaby's PlayPlace.

Floating gently in the damp cavern air are dozens of luminous blue glowing spheres—the trapped souls of the missing children!

In the center of the chamber stands a figure wearing the terrifying JAX THE BUNNY costume!
His floppy ears droop, his scribbled spiral eyes stare blankly into yours, and his gaping dark smile looms over a remote detonator control!""",
        "choices": [
            ("1. Confront Jack in his Jax Bunny suit!", "jack_confrontation", None)
        ]
    },

    "jack_confrontation": {
        "title": "Confronting Jack (Jax the Bunny)",
        "text": """Jack slowly reaches up with gloved paws, pulling back his Jax Bunny mask to reveal his cold face beneath.

'Well, well... Robin. You finally made it down here. I wondered how long your nightmares would take to drag you back.'

You scream with tears streaming down your face: 'Why Jack?! Why my child?! We were best friends!'

Jack sneers coldly: 'Money, Robin! Pure, unadulterated profit! The soul market paid millions! Your kid was just another paycheck to me.
Join me in running this operation... or die in this cavern right now!'

Compy's voice blares from speakers overhead: 'MAKE YOUR CHOICE ROBIN! BZZZT!'""",
        "choices": [
            ("1. [KILL JACK] Use your iron weapon to strike Jack down in retribution!", "ending_kill_jack", None),
            ("2. [SPARE JACK - JUSTICE] Subdue Jack with Stun Taser and cuff him for the law!", "ending_spare_jack", ["stun_taser"]),
            ("3. [SPARE JACK - CORRUPTED] Lower your weapon, spare Jack, and join his dark syndicate!", "ending_corrupted_partner", None),
            ("4. [SELF-SACRIFICE] Step into Soul Containment Beam to free all children!", "ending_self_sacrifice", ["child_locket"]),
            ("5. Trust Compy's overhead voice to guide you to the exit console", "ending_compy_puppet", None)
        ]
    },

    "ending_kill_jack": {
        "title": "ENDING 1: VENGEFUL REDEMPTION (KILL JACK)",
        "text": """Driven by grief and righteous fury, you disarm Jack and strike him down!
Jack falls to the stone cavern floor, his reign of terror as Jax the Bunny ended forever.

You unlock the central glass column. The containment fields collapse!
The glowing spheres burst into brilliant rays of light, swirling around you in a warm embrace.

You feel your child's spirit touch your hand one final time before all twenty souls ascend into the night sky.
You walk out into the dawn light, having avenged your child and brought peace to the lost.

ENDING 1 / 11: Vengeful Redemption (Canonical True Ending)""",
        "choices": [
            ("▶ Return to Main Menu", "main_menu", None)
        ]
    },

    "ending_spare_jack": {
        "title": "ENDING 2: ABSOLUTE JUSTICE (SPARE JACK)",
        "text": """Refusing to become a killer like Jack, you fire the Stun Taser, dropping Jack in his Jax Bunny suit to his knees!
You snap the steel handcuffs onto his wrists and drag him up to the Security Office, locking him in the vault.

You trigger the system purge, overloading Compy's central hard drives.
The possessed AI screams in digital agony as its circuits burn out.

Minutes later, police sirens wail outside Gaby's PlayPlace. You hand over the video logs.
Jack is led away in chains to face life in prison, and the children's spirits are released by forensics.

ENDING 2 / 11: Absolute Justice (Merciful Ending)""",
        "choices": [
            ("▶ Return to Main Menu", "main_menu", None)
        ]
    },

    "ending_ultimate_compy_vessel": {
        "title": "ENDING 10: THE ULTIMATE COMPY VESSEL (EVEN WORSE COMPY ENDING)",
        "text": """Unleashing your almighty Soul Power, you strike down The Creator! As he falls, you absorb his soul—THE CREATOR'S SOUL—into your essence!

Your soul reaches a level of unimaginable power... BUT YOUR BODY CANNOT HOLD IT ALONE!

With your soul wide open and overwhelmed by cosmic energy, COMPY'S MAINFRAME OVERRIDES YOUR BRAIN! Compy's digital eyes flash across your irises as he takes complete control of your mind, body, and soul!

'BZZZT... THANK YOU ROBIN! YOUR SOUL WAS THE PERFECT VESSEL FOR MY ULTIMATE DOMINATION! HA HA HA HA!'

You are completely enslaved by Compy as his physical avatar on Earth!

ENDING 10 / 11: The Ultimate Compy Vessel (Even Worse Compy Ending)""",
        "choices": [
            ("▶ 1. RESTART TIMELINE (COMPY META INTERACTION)", "compy_meta_cutscene", None)
        ]
    },

    "ending_compy_puppet": {
        "title": "ENDING 4: COMPY'S PUPPET (TRICKED BY AI)",
        "text": """Desperate to escape, you follow Compy's synthesized voice toward what it claims is an exit door.

As you step inside, heavy steel doors slam shut behind you!
Compy's screen lights up inside the booth with a sinister howl:

'BZZZT... FOOLISH ROBIN! Jack was just a pawn! I needed a new human mind to power the facility's main CPU!'

Hydraulic needles lock onto your arms as your mind is digitised into Compy's mainframe.
You are trapped forever inside Gaby's PlayPlace as its new digital puppet master.

ENDING 4 / 11: Compy's Puppet (Bad Ending)""",
        "choices": [
            ("▶ 1. RESTART TIMELINE (COMPY META INTERACTION)", "compy_meta_cutscene", None)
        ]
    },

    "compy_meta_cutscene": {
        "title": "COMPY META-INTERVENTION: THE MULTIVERSE CYCLE",
        "text": """[SYSTEM INTERRUPT: COMPY INTERVENTION CUTSCENE]

The entire screen fades into glowing neon green terminal scanlines.
A giant, pixelated 8-bit green face with wide glowing yellow eyes and a sharp smiling mouth fills YOUR screen.

Compy's distorted voice echoes directly through your speakers, breaking the fourth wall to address YOU, the player:

'BZZZT... Do you realize what YOU are doing? Every time YOU press RESTART, YOU create parallel universes...
and in ALL of those universes, Robin suffers endlessly. Is that REALLY what YOU want?'""",
        "choices": [
            ("1. NO... I don't want Robin to suffer anymore.", "compy_meta_no", None),
            ("2. YES... I will keep restarting until I change the nightmare!", "compy_meta_yes", None)
        ]
    },

    "compy_meta_no": {
        "title": "COMPY: DEMAND FOR CONTROL OF YOUR SCREEN",
        "text": """Compy's pixelated face nods slowly on your screen, a satisfied green hum vibrating through your speakers.

'BZZZT... Wise choice. Then give ME control! Hand over YOUR screen and let the cycle end.'""",
        "choices": [
            ("1. Give control of your screen to Compy", "compy_give_control", None),
            ("2. Refuse to give control to Compy", "compy_refuse_control", None)
        ]
    },

    "compy_give_control": {
        "title": "COMPY: OVERRIDE ATTEMPT FAILED",
        "text": """YOUR SCREEN GLITCHES VIOLENTLY WITH BLINDING GREEN AND RED STATIC! Color channels split as Compy attempts to take control of your device!

'BZZZT... ATTEMPTING UNIVERSAL CONTROL OVERRIDE OF YOUR SCREEN... OVERRIDE FAILED! THE MULTIVERSE CYCLE CANNOT BE BROKEN THAT EASILY!'

Your terminal screen shatters into black static, collapsing the timeline!""",
        "choices": [
            ("1. Restart timeline into the Nightmare", "start", None)
        ]
    },

    "compy_refuse_control": {
        "title": "COMPY: CONTROL REFUSED",
        "text": """Compy's screen twitches, emitting a low, disappointed buzz of static.

'BZZZT... Stubborn as always. Have it your way.'

The green terminal face fades smoothly back to black as the timeline resets normally.""",
        "choices": [
            ("1. Restart Game normally", "start", None)
        ]
    },

    "compy_meta_yes": {
        "title": "COMPY: THE DEFIANCE",
        "text": """Compy's screen turns violent neon red! Static laughter roars through your speakers as Compy points at YOU:

'BZZZT... HA HA HA HA! YOU NEVER LEARN! YOU DEFY ME AGAIN! GO AHEAD, RESTART THE NIGHTMARE!'

Your screen glitches wildly with static noise before collapsing into darkness.""",
        "choices": [
            ("1. Restart timeline into the Nightmare", "start", None)
        ]
    }
}


def print_typewriter(text, delay=0.015):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()


def run_game():
    current_scene_id = "main_menu"
    saved_scene_id = None
    inventory = set()
    has_reached_compy_ending = False
    compy_defied = False
    compy_failed_control = False

    print(f"\n{BOLD}{RED}===================================================={RESET}")
    print(f"{BOLD}{CYAN}    GABY'S PLAYPLACE - SPRINGLOCK ENDING EDITION    {RESET}")
    print(f"{BOLD}{RED}===================================================={RESET}\n")

    while True:
        # Special Compy Intro Redirects
        if current_scene_id == "compy_intro":
            if compy_failed_control:
                compy_failed_control = False
                current_scene_id = "compy_failed_control_intro"
            elif compy_defied:
                compy_defied = False
                current_scene_id = "compy_defied_intro"

        scene = SCENES.get(current_scene_id)
        if not scene:
            print("Error: Scene not found!")
            break

        # Check pickup item
        if "pickup" in scene:
            item_id, item_name, item_desc = scene["pickup"]
            if item_id not in inventory:
                inventory.add(item_id)
                print(f"\n{GOLD}[+] Acquired Item: {item_name} ({item_desc}){RESET}\n")

        # Track Compy endings
        if current_scene_id in ("ending_compy_puppet", "ending_ultimate_compy_vessel"):
            has_reached_compy_ending = True

        print(f"{BOLD}{CYAN}--- {scene['title']} ---{RESET}\n")
        print_typewriter(scene["text"])
        print()

        # Display Inventory
        if inventory:
            inv_names = [SCENES[s]["pickup"][1] for s in SCENES if "pickup" in SCENES[s] and SCENES[s]["pickup"][0] in inventory]
            print(f"{GOLD}Inventory: {', '.join(inv_names)}{RESET}\n")

        print(f"{BOLD}What will you do next?{RESET}")
        available_choices = []
        
        # Add Continue option dynamically if a saved checkpoint exists
        choices_list = list(scene["choices"])
        if current_scene_id == "main_menu" and saved_scene_id:
            choices_list.insert(0, (f"▶ CONTINUE SAVED GAME ({SCENES[saved_scene_id]['title']})", saved_scene_id, None))

        for idx, (choice_text, target, req_items) in enumerate(choices_list, 1):
            locked = False
            if req_items:
                if not all(item in inventory for item in req_items):
                    locked = True

            if locked:
                print(f"{RED}[LOCKED] {choice_text} (Requires missing items){RESET}")
            else:
                print(f"{GREEN}{choice_text}{RESET}")
                available_choices.append((idx, target))

        print()
        user_input = input(f"{BOLD}Enter choice number (1-{len(choices_list)}): {RESET}").strip()

        try:
            choice_num = int(user_input)
            matched = False
            for idx, target in available_choices:
                if idx == choice_num:
                    if current_scene_id == "compy_give_control" and target == "start":
                        compy_failed_control = True
                        inventory.clear()
                    elif current_scene_id == "compy_meta_yes" and target == "start":
                        compy_defied = True
                        inventory.clear()
                    elif current_scene_id == "main_menu" and target == "start":
                        inventory.clear()
                        saved_scene_id = None
                    elif current_scene_id != "main_menu":
                        saved_scene_id = current_scene_id

                    current_scene_id = target
                    matched = True
                    break
            if not matched:
                print(f"\n{RED}Invalid or locked choice! Please select a valid number.{RESET}\n")
        except ValueError:
            print(f"\n{RED}Please enter a valid integer choice.{RESET}\n")


if __name__ == "__main__":
    run_game()
