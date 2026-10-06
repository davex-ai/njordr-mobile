// Static company pages (same copy as the web app's /info/[slug]).
export const infoPages: Record<string, { title: string; body: string[] }> = {
  about: {
    title: "About Njörðr",
    body: [
      "Njörðr is named after the Norse god of the sea, wealth and trade. We bring a curated range of everyday essentials to one clean, fast storefront.",
      "This is placeholder copy. Replace it with your story.",
    ],
  },
  shipping: {
    title: "Shipping",
    body: ["We deliver to the address saved in your account.", "This is placeholder copy. Add delivery areas, times and fees here."],
  },
  returns: {
    title: "Returns",
    body: ["Changed your mind? Tell us and we'll help.", "This is placeholder copy. Add your return window and process here."],
  },
  contact: {
    title: "Contact",
    body: ["Questions about an order? Email hello@njordr.example.", "This is placeholder copy. Replace with real contact details."],
  },
  privacy: {
    title: "Privacy",
    body: ["We only use your details to process your orders.", "This is placeholder copy. Replace with your privacy policy."],
  },
};
