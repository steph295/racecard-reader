import type { RawRace } from "./types";

// Auto-extracted fixture data from the original prototype (one demo meeting:
// 8 races, ~79 runners). Field names/shape match RawRace/RawRunner below 1:1.
// Used to seed the database for local development and demos.
export const demoRaces: RawRace[] = [
    { id: 'r1', time: '2:15', name: 'Selling Handicap Stakes (Class 6)', going: 'Standard', distance: '1m 4f',
      runners: [
        { no: 1, draw: 3, form: '0502-00', or: 56, name: 'MISTER DAYDREAM (IRE)', silkSrc: 'assets/silk-1.png', subnote: 'Sampled 21/05/25',
          sire: 'Make Believe (GB)', dam: "Teo's Sister (IRE)", ageSex: '5yo B G', weight: '10-0',
          jockey: 'Rhys Clutterbuck', trainer: 'Gary & Josh Moore', owner: 'Mr Niall Houlihan',
          reports: [{ date: '21 May', time: '4:05', track: 'AYR', items: [
            { cat: 'Stewards enquiry', detail: 'No explanation' },
            { cat: 'Trainer/vet report', tag: 'Tested', detail: 'Nothing to report' }
          ]}] },
        { no: 2, draw: 5, form: '065-560', or: 43, name: 'LUNAR POWER (IRE)', silkSrc: 'assets/silk-2.png', subnote: 'Sampled 27/08/25',
          sire: 'Power (GB)', dam: 'Dusty Moon (GB)', ageSex: '8yo C G', weight: '9-13',
          jockey: 'Georgia Dobie', trainer: 'Laura Mongan', owner: 'Mrs L. J. Mongan',
          reports: [{ date: '27 Aug', time: '4:00', track: 'MUS', items: [
            { cat: 'Rider report', detail: 'Never travelling' },
            { cat: 'Trainer/vet report', tag: 'Tested', detail: 'Nothing to report' }
          ]}] },
        { no: 3, draw: 2, form: '600-450', or: 0, name: 'MOONLIT CLOUD (GB)', silkSrc: 'assets/silk-3.png', subnote: null,
          sire: 'Sea The Moon (GER)', dam: 'Apple Blossom (IRE)', ageSex: '8yo B F', weight: '9-6',
          jockey: 'Robert Havlin', trainer: 'Dean Ivory', owner: 'Mr K. T. Ivory',
          reports: [{ date: '28 Jun', time: '4:35', track: 'WDR', items: [
            { cat: 'Trainer/vet report', detail: 'Not suited by going' }
          ]}] },
        { no: 4, draw: 9, form: '250-005', or: 44, name: 'DOUGLAS DC (IRE)', nr: true, silkSrc: 'assets/silk-4.png', subnote: 'Non-runner \u00b7 Not eaten up',
          sire: 'Zoffany (IRE)', dam: 'Hollie Point (GB)', ageSex: '8yo B G', weight: '9-5',
          jockey: 'Non-runner', trainer: 'Tony Carroll', owner: 'Mrs Susan Keable',
          reports: [{ date: '6 Nov', time: '1:05', track: 'NBY', items: [
            { cat: 'Trainer/vet report', detail: 'Bled from nose' }
          ]}] },
        { no: 5, draw: 4, form: '024463', or: 46, name: 'CEZARRO (IRE)', silkSrc: 'assets/silk-5.png', subnote: 'New trainer \u00b7 Sampled 20/05/26',
          sire: 'Acclamation (GB)', dam: 'Grace To Grace (IRE)', ageSex: '4yo B G', weight: '9-3',
          jockey: 'David Probert', trainer: 'Max Young', owner: 'The Regal Eagles',
          reports: [] },
        { no: 6, draw: 7, form: '504630', or: 57, name: 'HEART SIGN (GB)', silkSrc: 'assets/silk-6.png', subnote: null,
          sire: 'Masar (IRE)', dam: 'My Heart (GB)', ageSex: '3yo C G', weight: '9-3',
          jockey: 'Oisin Murphy', trainer: 'Jack Morland', owner: 'Mr David Hicken',
          reports: [{ date: '6 Jul', time: '2:15', track: 'LIN', items: [
            { cat: 'Rider report', detail: 'Ran too free' }
          ]}] },
        { no: 7, draw: 8, form: '334600', or: 7, name: 'MARINAKIS (IRE)', silkSrc: 'assets/silk-7.png', subnote: 'Sampled 11/01/26',
          sire: 'Ulysses (IRE)', dam: 'Giennah (IRE)', ageSex: '6yo B G', weight: '9-2',
          jockey: 'Luke Morris', trainer: 'Robert Stephens', owner: 'Castle Farm Racing',
          reports: [
            { date: '9 Jan', time: '8:15', track: null, items: [{ cat: 'Note', detail: 'Improved run' }] },
            { date: '16 Jul', time: '8:10', track: 'YAR', items: [{ cat: 'Rider report', detail: 'Denied a clear run' }] }
          ] },
        { no: 8, draw: 6, form: '0-00005', or: 59, name: 'ALEX THE GREAT (IRE)', nr: true, silkSrc: 'assets/silk-8.png', subnote: 'Non-runner \u00b7 Self cert',
          sire: 'Camelot (GB)', dam: 'Moonrise Landing (IRE)', ageSex: '6yo G G', weight: '9-1',
          jockey: 'Non-runner', trainer: 'Tony Carroll', owner: 'Mill House Racing',
          reports: [{ date: '5 May', time: '6:12', track: 'HER', items: [
            { cat: 'Rider report', detail: 'Made a bad mistake' }
          ]}] },
        { no: 9, draw: 10, form: '56000', or: 42, name: 'PREMIER CRU (GB)', silkSrc: 'assets/silk-9.png', subnote: null,
          sire: 'Nathaniel (IRE)', dam: 'Perfectly Spirited (GB)', ageSex: '3yo B F', weight: '9-1',
          jockey: 'Daniel Muscutt', trainer: 'James Fanshawe', owner: 'Premier Cru Partnership',
          reports: [] },
        { no: 10, draw: 11, form: '005-300', or: 5, name: 'MARYLAND STAR (GB)', silkSrc: 'assets/silk-10.png', subnote: null,
          sire: 'Cable Bay (IRE)', dam: 'All Things Gold (GB)', ageSex: '3yo B F', weight: '8-9',
          jockey: 'John Egan', trainer: 'Dean Ivory', owner: 'Radlett Racing',
          reports: [{ date: '5 Jun', time: '8:25', track: 'BTH', items: [
            { cat: 'Rider report', detail: 'Lost action' },
            { cat: 'Trainer/vet report', detail: 'Nothing to report' }
          ]}] },
        { no: 11, draw: 1, form: '004-503', or: 43, name: 'SAPPHIRE DREAM (IRE)', silkSrc: 'assets/silk-11.png', subnote: null,
          sire: 'Cotai Glory (GB)', dam: 'French Blue (GB)', ageSex: '3yo C G', weight: '8-3',
          jockey: 'Tyler Heard', trainer: 'Charlie Clover', owner: null,
          reports: [] }
      ]
    },

    { id: 'r2', time: '2:45', name: 'Sky Sports Racing Sky 415 Novice Stakes (Class 3) (Div I)', going: 'Standard', distance: '7f 2y',
      runners: [
        { no: 1, draw: 7, form: '6', or: 17, name: 'CARROW ROAD (GB)', sire: 'Caturra (IRE)', dam: 'Forever Excel (IRE)', ageSex: '2yo B C', weight: '9-7', jockey: 'Joey Haynes', trainer: 'Chelsea Banham', owner: 'Power Geneva', reports: [] },
        { no: 2, draw: 8, form: '6', or: 75, name: 'CAVALIER (IRE)', sire: 'Minzaal (IRE)', dam: 'Silver Machine (GB)', ageSex: '2yo B C', weight: '9-7', jockey: 'Sean Levey', trainer: 'Richard Hannon', owner: 'Highclere Thoroughbred', reports: [] },
        { no: 3, draw: 3, form: null, or: null, name: 'DRUM BAY (GB)', sire: 'New Bay (GB)', dam: 'Chamade (GB)', ageSex: '2yo C C', weight: '9-7', jockey: 'Rossa Ryan', trainer: 'Ralph Beckett', owner: 'Mrs David Aykroyd', reports: [] },
        { no: 4, draw: 10, form: null, or: null, name: 'HARBOUR PRINCE (GB)', sire: 'Palace Pier (GB)', dam: 'Princess Cammie (IRE)', ageSex: '2yo B C', weight: '9-7', jockey: 'Jack Mitchell', trainer: 'James Horton', owner: 'Mr Laurence Holder', reports: [] },
        { no: 5, draw: 1, form: null, or: null, name: 'MINO (GB)', sire: 'Palace Pier (GB)', dam: 'Far Hope (IRE)', ageSex: '2yo B C', weight: '9-7', jockey: 'Hector Crouch', trainer: 'Marco Botti', owner: 'Mr Jonny Allison', reports: [] },
        { no: 6, draw: 5, form: null, or: null, name: 'PEAK TRAM (USA)', subnote: 'Sampled 29/12/25', sire: "Liam's Map (USA)", dam: 'Mount Kellett (USA)', ageSex: '2yo B C', weight: '9-7', jockey: 'Luke Morris', trainer: 'Sir Mark Prescott Bt', owner: 'Mr Ian Banwell', reports: [] },
        { no: 7, draw: 6, form: '2', or: 75, name: 'PERFECT NATION (IRE)', subnote: 'Selected for sampling', sire: 'Sioux Nation (USA)', dam: 'Giuliana (GER)', ageSex: '2yo B C', weight: '9-7', jockey: 'Billy Loughnane', trainer: 'George Boughey', owner: 'Basher Watts Racing', reports: [] },
        { no: 8, draw: 2, form: null, or: null, name: 'SON OF A FISH (GB)', sire: 'Territories (IRE)', dam: 'Tejano (IRE)', ageSex: '2yo C C', weight: '9-7', jockey: 'Pat Dobbs', trainer: 'Richard Hannon', owner: 'Miss Lori Kate Jerome', reports: [] },
        { no: 9, draw: 9, form: null, or: null, name: 'THERE GOES MY HERO (GB)', sire: 'Rumble Inthejungle (IRE)', dam: 'Myladyjane (IRE)', ageSex: '2yo C C', weight: '9-7', jockey: 'Josephine Gordon', trainer: 'Keiran Burke', owner: 'Mr Keiran Burke',
          reports: [{ date: '6 Jul', time: '2:45', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Ran green' }] }] },
        { no: 10, draw: 4, form: '04', or: 61, name: 'GOBLET (GB)', sire: 'Zarak (FR)', dam: 'Permission (GB)', ageSex: '2yo B F', weight: '9-2', jockey: 'Callum Hutchinson', trainer: 'Hughie Morrison', owner: 'J F Dean, Mrs J Scargill',
          reports: [{ date: '6 Jul', time: '2:45', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Other' }] }] }
      ]
    },

    { id: 'r3', time: '3:15', name: 'Sky Sports Racing Sky 415 Novice Stakes (Class 3) (Div II)', going: 'Standard', distance: '7f 2y',
      runners: [
        { no: 1, draw: 3, form: null, or: null, name: 'APULIA BAY (IRE)', sire: 'Too Darn Hot (GB)', dam: "Stella d'Italia (GB)", ageSex: '2yo B C', weight: '9-7', jockey: 'Harry Davies', trainer: 'Simon & Ed Crisford', owner: 'Rabbah Racing', reports: [] },
        { no: 2, draw: 2, form: '4', or: 77, name: 'CLOUD SUMMIT (IRE)', subnote: 'Sampled 25/03/26', sire: 'No Nay Never (USA)', dam: 'Chaberton (USA)', ageSex: '2yo B C', weight: '9-7', jockey: 'Billy Loughnane', trainer: 'George Boughey', owner: 'The Acorn Partnership', reports: [] },
        { no: 3, draw: 6, form: '60', or: 65, name: 'IL CAPO (IRE)', sire: 'Supremacy (IRE)', dam: 'Vegatina (GB)', ageSex: '2yo B C', weight: '9-7', jockey: 'Sean Levey', trainer: 'Richard Hannon', owner: 'Mr M Blencowe', reports: [] },
        { no: 4, draw: 8, form: '0', or: 51, name: 'MINZAAL TIME (IRE)', sire: 'Minzaal (IRE)', dam: 'Oriental Step (IRE)', ageSex: '2yo B C', weight: '9-7', jockey: 'David Probert', trainer: 'Richard Hughes', owner: 'Mr Jaber Abdullah', reports: [] },
        { no: 5, draw: 7, form: '40', or: 88, name: 'ROMANZA (GB)', sire: 'Frankel (GB)', dam: 'Con Te Partiro (USA)', ageSex: '2yo B C', weight: '9-7', jockey: 'Paddy Bradley', trainer: 'Charlie Fellowes', owner: 'Mr P. Hickman', reports: [] },
        { no: 6, draw: 1, form: null, or: null, name: 'ROYAL TITAN (USA)', subnote: 'Sampled 19/04/26', sire: "Bolt D'oro (USA)", dam: 'Blue Beryl (USA)', ageSex: '2yo B C', weight: '9-7', jockey: 'Hector Crouch', trainer: 'Marco Botti', owner: 'Hamza Laith', reports: [] },
        { no: 7, draw: 4, form: '2', or: 77, name: 'SEA IDOL (GB)', sire: 'Sea The Moon (GER)', dam: 'New England Wave (FR)', ageSex: '2yo B G', weight: '9-7', jockey: 'Luke Morris', trainer: 'Sir Mark Prescott Bt', owner: 'Belcher, Gregson', reports: [] },
        { no: 8, draw: 9, form: '0', or: 62, name: 'THUNDER HOME (IRE)', sire: 'Night of Thunder (IRE)', dam: 'Accommodate (IRE)', ageSex: '2yo B C', weight: '9-7', jockey: 'Daniel Muscutt', trainer: 'James Horton', owner: 'Mr Saeed Suhail', reports: [] },
        { no: 9, draw: 5, form: '240', or: 78, name: 'VICTORY GOLD (IRE)', sire: 'Space Blues (IRE)', dam: 'Jollify (IRE)', ageSex: '2yo B C', weight: '9-7', jockey: 'Oisin Murphy', trainer: 'Saeed bin Suroor', owner: 'Godolphin', reports: [] }
      ]
    },

    { id: 'r4', time: '3:45', name: "Syd Renwick 90th Birthday Handicap Stakes (Class 6)", going: 'Standard', distance: '1m 7f 169y',
      runners: [
        { no: 1, draw: 9, form: '0002-03', or: 55, name: 'ARTAVIAN (GB)', subnote: 'Sampled 19/02/26', sire: 'Tasleet (GB)', dam: 'Miss Villefranche (GB)', ageSex: '6yo B G', weight: '10-2', jockey: 'David Probert', trainer: 'Patrick Chamings', owner: 'G E Bassett & P R',
          reports: [{ date: '22 May', time: '9:00', track: 'KMP', items: [{ cat: 'Trainer/vet report', detail: 'Lost left-hind shoe' }] }] },
        { no: 2, draw: 2, form: '0-0630', or: 26, name: 'MASTER DANCER (FR)', subnote: 'Sampled 27/12/22', sire: 'Masterstroke (USA)', dam: "Perle d'Ainay (FR)", ageSex: '9yo B G', weight: '9-12', jockey: 'William Carver', trainer: 'Richard Bandey', owner: 'The Dancer Quartet',
          reports: [{ date: '6 Jul', time: '3:45', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Never travelling' }] }] },
        { no: 3, draw: 6, form: '023-651', or: 48, name: 'BREAK POINT (GB)', sire: 'Iffraaj (GB)', dam: 'Final Set (IRE)', ageSex: '6yo B G', weight: '9-11', jockey: 'Jude Fernandes (7)', trainer: 'Luke Dace', owner: 'If Only Partnership',
          reports: [
            { date: '24 Nov', time: '3:56', track: null, items: [{ cat: 'Note', detail: "Starting stalls \u2014 starter's report, 1st occasion" }] },
            { date: '16 Jan', time: '7:30', track: 'WOL', items: [{ cat: 'Rider report', detail: 'Hanging left-handed' }, { cat: 'Trainer/vet report', detail: 'Nothing to report' }] }
          ] },
        { no: 4, draw: 8, form: '36660-2', or: 50, name: 'LA TRINITE (GB)', sire: 'Time Test (GB)', dam: 'Silken Ocean (GB)', ageSex: '4yo B F', weight: '9-10', jockey: 'Dougie Costello', trainer: 'Neil King', owner: 'Mr J. L. Rowsell',
          reports: [
            { date: '4 Aug', time: '8:03', track: null, items: [{ cat: 'Note', detail: 'Unruly \u2014 noted, 1st occasion' }] },
            { date: '6 Jul', time: '3:45', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Hanging left-handed' }] }
          ] },
        { no: 5, draw: 1, form: '00-2241', or: 60, name: 'WORLINGTON (GB)', sire: 'Sea The Stars (IRE)', dam: 'Nessina (USA)', ageSex: '3yo C G', weight: '9-7', jockey: 'Billy Loughnane', trainer: 'George Boughey', owner: 'Ed Ware, Ed Babington',
          reports: [{ date: '23 May', time: '8:30', track: 'WDR', items: [{ cat: 'Rider report', detail: 'Never travelling' }] }] },
        { no: 6, draw: 4, form: '6240-50', or: 27, name: 'SMITH (IRE)', subnote: 'Sampled 22/12/24', sire: 'Dawn Approach (IRE)', dam: 'Alazeya (IRE)', ageSex: '10yo C G', weight: '9-5', jockey: 'Robert Havlin', trainer: 'Lydia Richards', owner: 'Mrs Lydia Richards',
          reports: [
            { date: '20 May', time: '3:42', track: null, items: [{ cat: 'Note', detail: 'Going/track related enquiry' }] },
            { date: '8 Nov', time: '3:45', track: 'FON', items: [{ cat: 'Rider report', detail: 'Hanging left-handed' }] }
          ] },
        { no: 7, draw: 3, form: '6600-55', or: 48, name: 'HOME SECRETARY (GB)', subnote: 'Selected for sampling', sire: 'Galiway (GB)', dam: 'Cosmique (FR)', ageSex: '3yo B G', weight: '9-3', jockey: 'Luke Morris', trainer: 'Sir Mark Prescott Bt', owner: 'Highclere Thoroughbred', reports: [] },
        { no: 8, draw: 7, form: '640-05', or: 46, name: 'FEMME FATALE (GB)', sire: 'Sea The Moon (GER)', dam: 'Tantilize (GB)', ageSex: '3yo B F', weight: '9-1', jockey: 'Hector Crouch', trainer: 'James Tate', owner: 'Heart of the South', reports: [] },
        { no: 9, draw: 5, form: '0600-', or: 34, name: 'OCTOBER SURPRISE (GB)', subnote: 'New trainer', sire: 'Ulysses (IRE)', dam: 'Caravela (IRE)', ageSex: '3yo C G', weight: '8-5', jockey: 'Tyler Heard', trainer: 'Sheena West', owner: 'Miss Sheena West', reports: [] }
      ]
    },

    { id: 'r5', time: '4:15', name: 'Sky Sports Racing Virgin 512 Handicap Stakes (Class 4) (Div I)', going: 'Standard', distance: '5f 6y',
      runners: [
        { no: 1, draw: 1, form: '125601', or: 87, name: "MICHAELA'S BOY (IRE)", subnote: 'Sampled 12/01/26', sire: 'Ribchester (IRE)', dam: 'Joyce Compton (IRE)', ageSex: '6yo C G', weight: '10-4', jockey: 'Luke Morris', trainer: 'Robert Cowell', owner: 'Mr S. Geraghty',
          reports: [{ date: '6 Jul', time: '4:15', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Other' }] }] },
        { no: 2, draw: 3, form: '16/-0234', or: 78, name: 'HAVANA BLAST (GB)', subnote: 'Sampled 17/07/24', sire: 'Havana Grey (GB)', dam: 'Bhangra (GB)', ageSex: '4yo G G', weight: '9-13', jockey: 'Daniel Muscutt', trainer: 'James Fanshawe', owner: 'Justwow',
          reports: [{ date: '2 Jun', time: '1:40', track: 'NOT', items: [{ cat: 'Rider report', detail: 'Ran too free' }] }] },
        { no: 3, draw: 8, form: '000-113', or: 77, name: 'LAW OF AVERAGE (GB)', subnote: 'Selected for sampling \u00b7 Sampled 29/04/26', sire: 'Pearl Secret (GB)', dam: 'High Class Girl (GB)', ageSex: '5yo B G', weight: '9-12', jockey: 'Joey Haynes', trainer: 'Chelsea Banham', owner: 'A140 Self Storage',
          reports: [
            { date: '30 Apr', time: '7:33', track: null, items: [{ cat: 'Note', detail: 'Improved run' }] },
            { date: '4 Sep', time: '6:20', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Other' }] }
          ] },
        { no: 4, draw: 9, form: '4-01600', or: 52, name: 'COUNSEL (GB)', nr: true, subnote: 'Non-runner \u00b7 Travel \u00b7 Sampled 24/03/26', sire: 'Frankel (GB)', dam: 'Honorina (GB)', ageSex: '8yo C G', weight: '9-10', jockey: 'Non-runner', trainer: 'Michael Appleby', owner: 'Value Racing',
          reports: [
            { date: '26 Mar', time: '6:28', track: null, items: [{ cat: 'Note', detail: 'Improved run' }] },
            { date: '6 Jun', time: '2:30', track: 'DON', items: [{ cat: 'Rider report', detail: 'Slipped / stumbled' }, { cat: 'Trainer/vet report', detail: 'Nothing to report' }] }
          ] },
        { no: 5, draw: 7, form: '01-0552', or: 80, name: 'LEBRON POWER (GB)', subnote: 'Sampled 25/10/25', sire: 'Starman (GB)', dam: 'Tuk Power (GB)', ageSex: '3yo C F', weight: '9-9', jockey: 'Sean Levey', trainer: 'Richard Hannon', owner: 'King Power Racing',
          reports: [
            { date: '25 Oct', time: '1:38', track: null, items: [{ cat: 'Note', detail: 'Improved run' }] },
            { date: '6 Jul', time: '4:15', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Hanging right-handed' }] }
          ] },
        { no: 6, draw: 2, form: '262526', or: 72, name: "NOGO'S DREAM (GB)", subnote: 'Sampled 23/06/25', sire: 'Oasis Dream (GB)', dam: 'Morning Chimes (IRE)', ageSex: '6yo B G', weight: '9-8', jockey: 'Oisin Murphy', trainer: 'Richard Hughes', owner: 'Mr R. J. Rexton',
          reports: [{ date: '22 Jun', time: '7:17', track: 'WDR', items: [{ cat: 'Rider report', detail: 'Denied a clear run' }] }] },
        { no: 7, draw: 4, form: '246-244', or: 61, name: 'HOODIE HOO (IRE)', subnote: 'Sampled 28/06/25', sire: 'Hello Youmzain (FR)', dam: 'Maygold (FR)', ageSex: '4yo B G', weight: '9-7', jockey: 'Billy Loughnane', trainer: 'Charles Hills', owner: 'Ged Mason, Sir Alex',
          reports: [{ date: '21 Jun', time: '4:56', track: 'BTN', items: [{ cat: 'Trainer/vet report', detail: 'Lost left-fore shoe' }] }] },
        { no: 8, draw: 5, form: '0-42250', or: 36, name: 'SANDSCREENDELIVERD (GB)', subnote: 'Sampled 09/08/25', sire: 'Bated Breath (GB)', dam: 'Blue Aegean (GB)', ageSex: '4yo B G', weight: '9-2', jockey: 'Pat Dobbs', trainer: 'Peter Crate', owner: 'Mr Peter Crate',
          reports: [
            { date: '11 Nov', time: '5:18', track: null, items: [{ cat: 'Note', detail: 'Unruly \u2014 noted, 1st occasion' }] },
            { date: '3 Jun', time: '8:15', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Slipped / stumbled' }] }
          ] },
        { no: 9, draw: 6, form: '065046', or: null, name: 'DONTSPOILASALE (IRE)', sire: 'Kuroshio (AUS)', dam: "Destiny's Kitten (IRE)", ageSex: '6yo B G', weight: '9-2', jockey: 'William Cox', trainer: 'Jim & Suzi Best', owner: 'Mr John Joseph Smith', reports: [] }
      ]
    },

    { id: 'r6', time: '4:50', name: 'Sky Sports Racing Virgin 512 Handicap Stakes (Class 4) (Div II)', going: 'Standard', distance: '5f 6y',
      runners: [
        { no: 1, draw: 5, form: '216531', or: 87, name: 'DYRHOLAEY (FR)', subnote: 'Sampled 20/04/26', sire: 'City Light (FR)', dam: 'Agua de Mar (FR)', ageSex: '5yo B G', weight: '10-4', jockey: 'Harry Vigors (5)', trainer: 'Archie Watson', owner: 'Marco Polo',
          reports: [{ date: '30 Jan', time: '1:42', track: 'SWL', items: [{ cat: 'Stewards enquiry', detail: 'No explanation' }, { cat: 'Trainer/vet report', tag: 'Tested', detail: 'Nothing to report' }] }] },
        { no: 2, draw: 7, form: '3-10004', or: 86, name: 'TEMPLE OF ATHENA (GB)', subnote: 'Sampled 17/03/26', sire: 'Magna Grecia (IRE)', dam: 'Dance Hall Girl (IRE)', ageSex: '3yo B F', weight: '9-13', jockey: 'Pierre-Louis Jamin', trainer: 'Brian Ellison', owner: 'Nick Bradley Racing',
          reports: [{ date: '14 May', time: '4:40', track: 'YRK', items: [{ cat: 'Rider report', detail: 'Suffered interference in running' }] }] },
        { no: 3, draw: 1, form: '242100', or: 72, name: 'ALMATY STAR (IRE)', subnote: 'Sampled 11/04/26', sire: 'Kodiac (GB)', dam: 'Sante (IRE)', ageSex: '6yo B G', weight: '9-11', jockey: 'Jack Mitchell', trainer: 'Robert Cowell', owner: 'Mrs B. Berresford',
          reports: [{ date: '4 Sep', time: '6:20', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Other' }, { cat: 'Rider report', detail: 'Slowly away' }] }] },
        { no: 4, draw: 8, form: '3025-12', or: 78, name: 'SOLAR EDGE (GB)', subnote: 'Sampled 27/04/26', sire: 'Havana Grey (GB)', dam: 'Heavenly Edge (GB)', ageSex: '4yo G G', weight: '9-9', jockey: 'Gina Mangan', trainer: 'Christopher Mason', owner: 'Taylor, Hodges, Mason',
          reports: [
            { date: '26 Aug', time: '9:55', track: null, items: [{ cat: 'Note', detail: 'Improved run' }] },
            { date: '14 Sep', time: '4:30', track: 'BTH', items: [{ cat: 'Rider report', detail: 'Ran too free' }] }
          ] },
        { no: 5, draw: 2, form: '05U530', or: 62, name: 'ACCRUAL (GB)', subnote: 'Sampled 07/01/26', sire: 'Profitable (IRE)', dam: 'Albertine Rose (GB)', ageSex: '5yo G G', weight: '9-9', jockey: 'Rossa Ryan', trainer: 'David Loughnane', owner: 'David Lowe',
          reports: [
            { date: '24 Sep', time: '9:36', track: null, items: [{ cat: 'Note', detail: 'Improved run' }] },
            { date: '28 Nov', time: '6:45', track: 'SWL', items: [{ cat: 'Rider report', detail: 'Ran too free' }] }
          ] },
        { no: 6, draw: 9, form: '005-000', or: 49, name: 'TAN RAPIDO (GB)', subnote: 'Selected for sampling \u00b7 Sampled 01/07/25', sire: 'Bated Breath (GB)', dam: 'If So (GB)', ageSex: '5yo B G', weight: '9-8', jockey: 'Paddy Bradley', trainer: 'Charlie Fellowes', owner: 'Bedford House Racing',
          reports: [
            { date: '6 Jul', time: '5:05', track: null, items: [{ cat: 'Note', detail: 'Improved run' }] },
            { date: '26 Apr', time: '1:15', track: 'SAN', items: [{ cat: 'Rider report', detail: 'Restless / fractious in stalls' }] }
          ] },
        { no: 7, draw: 6, form: '0055-45', or: 36, name: "ZIGGY'S MISSILE (IRE)", subnote: 'Sampled 19/06/25', sire: 'Blue Point (IRE)', dam: 'Shafaani (GB)', ageSex: '5yo B G', weight: '9-6', jockey: 'Billy Loughnane', trainer: 'Robert Cowell', owner: 'Middleham Park Racing',
          reports: [{ date: '3 May', time: '2:35', track: 'SAL', items: [{ cat: 'Rider report', detail: 'Stopped quickly' }, { cat: 'Trainer/vet report', detail: 'Nothing to report' }] }] },
        { no: 8, draw: 3, form: '60-0000', or: 87, name: 'NEZEEH (IRE)', subnote: 'New trainer \u00b7 Sampled 28/03/24', sire: 'Profitable (IRE)', dam: 'Snowstar (IRE)', ageSex: '5yo B G', weight: '9-2', jockey: 'William Cox', trainer: 'Jim & Suzi Best', owner: 'Cheam Marketing', reports: [] },
        { no: 9, draw: 4, form: '461464', or: 64, name: "MICK'S SPIRIT (GB)", subnote: 'Sampled 14/01/26', sire: 'Swiss Spirit (GB)', dam: 'Fortunately (GB)', ageSex: '8yo B G', weight: '8-12', jockey: 'Robert Havlin', trainer: 'Conrad Allen', owner: 'sportsdays.co.uk',
          reports: [{ date: '14 Feb', time: '2:00', track: 'LIN', items: [{ cat: 'Trainer/vet report', detail: 'Lost left-hind shoe' }] }] }
      ]
    },

    { id: 'r7', time: '5:20', name: 'Expert Entertainment & Event Solutions Restricted Novice Stakes (Class 5)', going: 'Standard', distance: '1m 1y',
      runners: [
        { no: 1, draw: 9, form: '15', or: 76, name: 'ROGUE DEFENCE (GB)', subnote: 'Sampled 26/05/26', sire: 'Dark Angel (IRE)', dam: "Rehn's Nest (IRE)", ageSex: '3yo G G', weight: '9-11', jockey: 'Billy Loughnane', trainer: 'Jack Jones', owner: 'The Rogues Gallery', reports: [] },
        { no: 2, draw: 1, form: '4-0', or: 47, name: 'LADY OF CHIVALRY (IRE)', sire: 'Zoustar (AUS)', dam: 'Caridade (USA)', ageSex: '4yo B F', weight: '9-8', jockey: 'William Cox', trainer: 'Patrick Chamings', owner: 'The Foxford House', reports: [] },
        { no: 3, draw: 6, form: '5', or: 46, name: 'NOTHING BUT LOVE (GB)', sire: 'Land Force (IRE)', dam: 'Alnoras (GB)', ageSex: '4yo B F', weight: '9-8', jockey: 'Callum Hutchinson', trainer: 'Dr Jon Scargill', owner: 'Mrs Susan Scargill',
          reports: [{ date: '6 Jun', time: '7:40', track: 'LIN', items: [{ cat: 'Rider report', detail: 'Ran green' }] }] },
        { no: 4, draw: 12, form: '654', or: 50, name: 'FIEFDOM (IRE)', sire: 'Profitable (IRE)', dam: 'Demesne (GB)', ageSex: '3yo B G', weight: '9-4', jockey: 'Robert Havlin', trainer: 'S. P. C. Woods', owner: 'Mr S. P. C. Woods', reports: [] },
        { no: 5, draw: 10, form: '50', or: 61, name: 'INGEMAR (GB)', sire: 'Victor Ludorum (GB)', dam: 'Alpen Glen (GB)', ageSex: '3yo C G', weight: '9-4', jockey: 'Harry Vigors (5)', trainer: 'Brian Meehan', owner: 'Martin Hughes',
          reports: [{ date: '30 Jun', time: '6:39', track: 'FLS', items: [{ cat: 'Rider report', detail: 'Ran too free' }] }] },
        { no: 6, draw: 7, form: '054', or: 63, name: 'SANTIAGO BOY (GB)', subnote: 'Sampled 27/03/25', sire: 'Mayson (GB)', dam: 'Atlantic Isle (GER)', ageSex: '3yo B G', weight: '9-4', jockey: 'Rossa Ryan', trainer: 'Charles Hills', owner: 'Rosehill Racing III', reports: [] },
        { no: 7, draw: 2, form: null, or: null, name: 'SEIGNEUR (GB)', sire: 'Kingman (GB)', dam: 'Swansdown (GB)', ageSex: '3yo B G', weight: '9-4', jockey: 'Daniel Muscutt', trainer: 'James Fanshawe', owner: 'Booth, Silver, Steed', reports: [] },
        { no: 8, draw: 3, form: '024', or: 71, name: 'WEST BYFLEET (GB)', sire: 'Dream Ahead (USA)', dam: 'Storm Chaser (FR)', ageSex: '3yo B C', weight: '9-4', jockey: 'David Probert', trainer: 'Jack Channon', owner: 'On The Ball Racing', reports: [] },
        { no: 9, draw: 4, form: '03', or: 72, name: 'MYTHOLOGICAL STAR (IRE)', sire: 'Magna Grecia (IRE)', dam: 'Astroglia (USA)', ageSex: '3yo B G', weight: '9-2', jockey: 'Ebrahim Nader', trainer: 'Daniel & Claire Kubler', owner: 'Capture The Moment', reports: [] },
        { no: 10, draw: 8, form: '55', or: 57, name: 'CHERRINGHAM (GB)', sire: 'Ulysses (IRE)', dam: 'Kind of Hush (IRE)', ageSex: '3yo B F', weight: '8-13', jockey: 'Jack Mitchell', trainer: 'Roger Varian', owner: 'Elite Racing Club', reports: [] },
        { no: 11, draw: 11, form: '06', or: 52, name: 'IVAT GHIA (IRE)', sire: 'Ghaiyyath (IRE)', dam: 'Kiss From A Rose (GB)', ageSex: '3yo C F', weight: '8-11', jockey: 'Tyler Heard', trainer: 'Mark Usher', owner: 'Twenty Four Carrot', reports: [] },
        { no: 12, draw: 5, form: null, or: null, name: 'LEGALLY BAY (GB)', sire: 'Without Parole (GB)', dam: 'Represent (IRE)', ageSex: '3yo B F', weight: '8-11', jockey: 'Luke Morris', trainer: 'Jack Morland', owner: 'Mr Laurence Holder', reports: [] }
      ]
    },

    { id: 'r8', time: '5:55', name: 'Follow @attheraces on Instagram Handicap Stakes (Class 6)', going: 'Standard', distance: '1m 1y',
      runners: [
        { no: 1, draw: 1, form: '6460', or: 17, name: 'ERNIE MCCREW (IRE)', subnote: 'Sampled 02/07/26', sire: 'Galileo Gold (GB)', dam: 'Forgiving Flower (GB)', ageSex: '3yo C G', weight: '9-9', jockey: 'Taylor Fisher', trainer: 'J. S. Moore', owner: 'Mr H Maye & J S Moore', reports: [] },
        { no: 2, draw: 4, form: '500', or: 48, name: 'WHAZZIMO (GB)', sire: 'Mohaather (GB)', dam: 'Whazzis (GB)', ageSex: '3yo B F', weight: '9-9', jockey: 'Daniel Muscutt', trainer: 'James Ferguson', owner: 'Mrs M. Ferguson', reports: [] },
        { no: 3, draw: 6, form: '26-2230', or: 27, name: 'ATHENIAN SPIRIT (IRE)', sire: 'Magna Grecia (IRE)', dam: 'Aleneva (IRE)', ageSex: '3yo B G', weight: '9-9', jockey: 'Hector Crouch', trainer: 'William Knight', owner: 'MPR XXI, S Marris', reports: [] },
        { no: 4, draw: 10, form: '400-060', or: 36, name: 'WILD ROSIE (GB)', subnote: 'Sampled 14/08/25', sire: 'Nathaniel (IRE)', dam: 'Rose Berry (GB)', ageSex: '3yo B F', weight: '9-9', jockey: 'William Carson', trainer: 'Chris Dwyer', owner: 'Strawberry Fields',
          reports: [{ date: '5 Sep', time: '2:55', track: 'ASC', items: [{ cat: 'Rider report', detail: 'Hanging left-handed' }] }] },
        { no: 5, draw: 9, form: '05-0223', or: 53, name: 'FALLACIOUS PROMISE (GB)', subnote: 'Selected for sampling', sire: 'Lope Y Fernandez (IRE)', dam: 'Byrony (IRE)', ageSex: '3yo B G', weight: '9-8', jockey: 'Luke Morris', trainer: 'John Butler', owner: 'Mrs Bettine Evans', reports: [] },
        { no: 6, draw: 7, form: '06060', or: 0, name: 'ACTION REACTION (GB)', sire: 'Masar (IRE)', dam: 'Perfect Showdance (GB)', ageSex: '3yo C F', weight: '9-7', jockey: 'Billy Loughnane', trainer: 'George Boughey', owner: 'Middleham Park Racing', reports: [] },
        { no: 7, draw: 8, form: '005', or: 48, name: 'MORAVIAN (IRE)', sire: 'Supremacy (IRE)', dam: 'Ban Og (IRE)', ageSex: '3yo C F', weight: '9-3', jockey: 'David Probert', trainer: 'Gary & Josh Moore', owner: 'Jane Davis and Sarah', reports: [] },
        { no: 8, draw: 2, form: '500-00', or: 30, name: 'HENFIELD (GB)', sire: 'Cityscape (GB)', dam: 'Mazikeen (GB)', ageSex: '3yo B F', weight: '9-1', jockey: 'Robert Havlin', trainer: 'Karen Jewell', owner: 'Mr D. E. Price', reports: [] },
        { no: 9, draw: 3, form: '000-54', or: 41, name: 'LAURASIA (GB)', sire: 'Mohaather (GB)', dam: 'Mrs Moops (GB)', ageSex: '3yo B F', weight: '9-1', jockey: 'Georgia Dobie', trainer: 'Laura Mongan', owner: 'Mrs P. J. Sheen', reports: [] },
        { no: 10, draw: 5, form: '00-006', or: 34, name: 'RUIZ (GB)', sire: 'Legends of War (USA)', dam: 'Vezere (USA)', ageSex: '3yo B G', weight: '9-0', jockey: 'Paddy Bradley', trainer: 'Simon Dow', owner: 'Mr Robert Moss',
          reports: [{ date: '6 Aug', time: '6:35', track: 'KMP', items: [{ cat: 'Rider report', detail: 'Ran too free' }] }] }
      ]
    }
  ];
