import { Footer as CommonFooter } from "@icco/react-common/Footer";

// Minimal footer: copyright + source-repo icon only.
export default function Footer() {
  return (
    <CommonFooter
      startYear={2014}
      sourceRepo="https://github.com/icco/roderick"
      showSocial={false}
      showRecurseRing={false}
      showXXIIVVRing={false}
      showRecurseCenter={false}
      showPrivacyPolicy={false}
    />
  );
}
