const parsed = (val) => JSON.parse(JSON.stringify(val));
const app = {
  name: "Illumbank",
  host: "mail.privateemail.com",
  url: "https://internetbanking.illumbk.com",
  email: "info@illumbk.com",
  phone: "+1 (213) 534 8731",
};
const date = (val) => {
  const date = new Date(val);
  const dd = date.toLocaleString("en-US", { day: "2-digit" });
  const mm = date.toLocaleString("en-US", { month: "2-digit" });
  const yy = date.toLocaleString("en-US", { year: "numeric" });
  return `${dd}.${mm}.${yy}`;
};
const time = (val) =>
  new Date(val).toLocaleString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
const rand = (min = 0, max = 16) =>
  Math.random().toString().split(".")[1].slice(min, max);
const month = ((Date.now() % 11) + 1).toString().padStart(2, "0");
module.exports = { app, filters: { date, time, rand, month }, parsed };
