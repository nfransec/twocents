
export const GenderOptions = ["Male", "Female", "Other"];

export const UserFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "Male" as Gender,
  bankStatement: [],
  privacyConsent: false,
  acknowledgementConsent: false,
};

export const IdentificationTypes = [
  "Birth Certificate",
  "Driver's License",
  "Medical Insurance Card/Policy",
  "Military ID Card",
  "National Identity Card",
  "Passport",
  "Resident Alien Card (Green Card)",
  "Social Security Card",
  "State ID Card",
  "Student ID Card",
  "Voter ID Card",
];

export const Cards = [
  {
    image: "/infinia-hdfc.png",
    name: "HDFC Infinia",
  },
  {
    image: "/PlatinumTravel-Amex.png",
    name: "Amex Plainum Travel",
  },
  {
    image: "/simplyclick-sbi.png",
    name: "SBI SimplyCLICK",
  },
  {
    image: "/play-rbl.png",
    name: "BookMyShow RBL PLaY",
  },
  {
    image: "/powerplus-au.png",
    name: "AU Power+",
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};
