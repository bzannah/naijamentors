import type { RosterMentor } from "@/lib/roster";
import { alAminDabo } from "./al-amin-dabo";
import { babaganaZannah } from "./babagana-zannah";
import { bakariArabi } from "./bakari-arabi";
import { ibrahimLabaranAli } from "./ibrahim-labaran-ali";
import { mujahidMuhammad } from "./mujahid-muhammad";
import { terryOsayawe } from "./terry-osayawe";
import { umarFaruk } from "./umar-faruk";

/*
  Real mentors the Naija Mentors team adds on their behalf, one file each (see RosterMentor in
  src/lib/roster.ts for every field). To add someone:
    1. Copy a file, fill it in from their public profile, and add it to the list below.
    2. If you have their photo, save it as public/mentors/<slug>.jpg and set `photo`.
    3. Deploy (the release step runs `npm run db:migrate`, which syncs the roster), or run `npm run mentors:sync`.
    4. Issue their sign-in details from /admin and send them over.
  New mentors join the directory in this order.
*/
export const ROSTER: RosterMentor[] = [
  ibrahimLabaranAli,
  alAminDabo,
  bakariArabi,
  babaganaZannah,
  umarFaruk,
  mujahidMuhammad,
  terryOsayawe,
];
