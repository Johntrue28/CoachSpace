import ProfileView from "@/components/shell/ProfileView";

export const metadata = { title: "Profile · CoachSpace" };

/** The coach's Profile (the avatar in the header, D-076): Calendar, Attendance and Settings. */
export default function ProfilePage() {
  return <ProfileView />;
}
