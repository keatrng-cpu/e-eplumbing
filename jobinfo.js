/* Plain-language "what it usually means / what the plumber does" for every
   pricebook option, keyed like OPTION_SCENES: EEJobInfo[service][optionIndex] = [means, does].
   Used by services.html detail panels. Copy only: no prices here (those come from pricebook.js). */
window.EEJobInfo = {
  "Emergency repair": [
    ["A supply line, fitting or valve is leaking and you can't stop it, or the shutoff won't hold.", "Finds the right valve, isolates the leak so the rest of the house has water again, and quotes the permanent fix."],
    ["A copper or PEX line has split, usually from freezing or age, somewhere we can reach.", "Shuts the water, cuts out the damaged section, installs new pipe and fittings, then pressure-checks for leaks."],
    ["A line froze and now has a small leak or a cracked fitting.", "Thaws the line safely with electric equipment, repairs the small leak, and checks the run for other weak spots."],
    ["Something's wrong and you're not sure what — water, noise, smell or no water.", "Diagnoses on site, explains what's going on, and gives you a flat-rate price before any repair."],
    ["Water is coming from somewhere you can't see: a ceiling stain, a wet wall, or a meter that spins with the taps off.", "Traces the leak with meter tests and inspection, shows you where it is, and quotes the repair before opening anything up."],
  ],
  "Drain / sewer": [
    ["One fixture drains slowly or not at all — hair, soap, grease or a toy in the trap.", "Clears the line with a hand or drum auger, runs water to confirm it flows, and leaves the area clean."],
    ["Several drains back up at once, or the floor drain gurgles — the main line is blocked.", "Opens the cleanout and augers the main to the street, then runs water to confirm it's clear."],
    ["The main keeps clogging from grease, roots or Valley clay silt; augering only pokes a hole.", "Scours the full pipe wall with high-pressure water so the line is cleaned, not just punched through."],
    ["There's no easy access point to clear your main, so every clog costs extra time.", "Installs a code-compliant cleanout fitting so future clears and camera work are quick."],
    ["Repeat backups, roots, or you're buying a house and want to know the sewer's condition.", "Runs a camera through the main, records video, and walks you through the findings and options."],
    ["One branch line (a bathroom or kitchen run) keeps clogging and you want to see why.", "Runs a smaller camera through that branch and shows you what's inside before recommending a fix."],
    ["A sewer smell in the house — often a dry trap, a failed wax ring, or a vent problem.", "Checks traps, seals and vents to find the source, then quotes the fix before doing it."],
  ],
  "Water heater": [
    ["Your tank is old or failing and you want a same-size, same-type replacement.", "Drains and removes the old tank, sets the new one, reconnects water and power or gas, and tests it. Labor only — the unit is priced separately."],
    ["The tank needs replacing and the install needs bringing up to current code (expansion tank, venting, pan, valves).", "Replaces the tank and adds the required code parts, then tests the whole setup. Labor only — the unit is priced separately."],
    ["Hard Valley water leaves scale in the tank: rumbling, less hot water, or it's been years since a flush.", "Drains and flushes the sediment, checks the relief valve and anode, and refills and tests the heater."],
    ["One part is failing: the relief valve drips, the water smells, or an electric element is out.", "Tests and replaces the failed valve, anode rod or element, then confirms hot water and safe pressure."],
    ["You want endless hot water and a smaller footprint than a tank.", "Sizes and installs a tankless unit with the right gas or electric supply, venting and water connections."],
    ["Water is pooling under or around the heater.", "Finds whether it's the tank itself or a fitting or valve, then tells you if it's a repair or a replacement — priced before work."],
  ],
  "Sump pump / flooding": [
    ["The pump hums, won't turn on, runs nonstop, or is just old before melt season.", "Removes the old pump, installs a new one with a working float, and tests it with water."],
    ["You want protection if the power goes out during a storm or the main pump fails.", "Adds a battery backup pump with its own float and alarm alongside your main pump."],
    ["Water runs back into the pit, or the discharge line leaks or freezes.", "Replaces the check valve and repairs or reroutes the discharge line so water leaves and stays out."],
    ["You want peace of mind before the Red River rises.", "Tests the pump, float and check valve with water, cleans the pit, and tells you if anything is close to failing."],
  ],
  "Frozen or burst pipe": [
    ["No water at a fixture after a cold snap — a line is frozen, maybe with a small leak.", "Thaws the line safely with electric equipment (never an open flame), fixes the small leak, and checks for more damage."],
    ["A pipe has burst somewhere we can reach and water got out.", "Shuts the water, replaces the damaged section, and pressure-checks the line before turning it back on."],
    ["The burst is in a slab, behind finished walls, or somewhere hard to reach.", "Assesses access first, explains the options (repair in place or reroute), and quotes before opening anything."],
  ],
  "Softener / filtration": [
    ["Your softener isn't softening: spots, scale, or salt that never goes down.", "Checks settings, brine and resin, cleans or adjusts it, and tells you if the resin needs replacing."],
    ["Valley water is hard and you want to protect fixtures, the heater and your skin.", "Installs a softener with a bypass and drain, sets it for your water, and shows you how to keep it running."],
    ["Orange stains, a rotten-egg smell, or drinking water that tastes off.", "Installs an iron filter for the whole house or an under-sink RO system for drinking water, then tests the output."],
  ],
  "Fixture install": [
    ["The toilet keeps running, rocks, cracks or leaks at the base, or you want a new one.", "Removes the old toilet, sets the new one on a fresh seal, connects the supply and checks for leaks."],
    ["The faucet drips, the handle is stiff, or you want a new look in the kitchen or bath.", "Removes the old faucet, installs the new one with new supply lines, and checks for leaks."],
    ["You're adding or replacing a shower.", "Installs the shower valve, drain and fixtures to code and tests for leaks before the walls close."],
    ["You're replacing or adding a bathtub.", "Sets the tub, connects the drain and overflow and the valve, and leak-tests everything."],
    ["The disposal hums, leaks, jams or won't turn on.", "Removes the old unit, installs a new disposal with proper drain and electrical connections, and tests it."],
    ["The shower drips, runs only hot or cold, or the handle is hard to turn — usually a worn cartridge.", "Shuts off the water, replaces the cartridge for your valve brand, and checks temperature and flow."],
  ],
  "Remodel / rough-in": [
    ["You're finishing a basement bath, re-piping an old house, or doing a fixture package.", "Walks the space with you, plans the plumbing to pass inspection, and gives a quote on site before any work."],
  ],
  Commercial: [
    ["Your business needs a backflow test, ongoing service, or plumbing for a build-out.", "Visits the site, scopes the work, and provides a written quote or service contract."],
  ],
  "Something else": [
    ["A smell, a noise, a strange bill — something that doesn't fit the other boxes.", "Diagnoses the problem on site and quotes the fix before doing any work."],
    ["Weak water at one fixture or the whole house.", "Checks aerators, valves, the pressure regulator and the lines to find the cause, then quotes the fix."],
  ],
};
