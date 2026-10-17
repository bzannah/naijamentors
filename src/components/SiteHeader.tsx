import { getCurrentUser } from "@/lib/auth";
import { mentorForUser, unreadTotal } from "@/lib/queries";
import { HeaderClient } from "./HeaderClient";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const [mentor, unread] = user ? await Promise.all([mentorForUser(user), unreadTotal(user)]) : [null, 0];
  return (
    <HeaderClient
      user={
        user
          ? {
              name: user.name,
              role: user.role,
              photo: mentor?.photo,
              profileHref: mentor ? `/mentors/${mentor.slug}` : undefined,
            }
          : null
      }
      unread={unread}
    />
  );
}
