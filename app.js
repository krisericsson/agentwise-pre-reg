import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Wires up a registration form.
 * @param {Object} opts
 * @param {string} opts.formId
 * @param {string} opts.source - 'member' or 'applicant'
 */
export function initRegistrationForm({ formId, source }) {
  const form = document.getElementById(formId);
  const errorEl = document.getElementById("error-msg");
  const submitBtn = form.querySelector('button[type="submit"]');
  const successEl = document.getElementById("success-state");
  const formStateEl = document.getElementById("form-state");

  function toE164(raw) {
    // very light normalisation: strip spaces/dashes, assume UK if no leading +
    let v = raw.trim().replace(/[\s\-()]/g, "");
    if (v.startsWith("00")) v = "+" + v.slice(2);
    if (!v.startsWith("+")) {
      if (v.startsWith("0")) v = "+44" + v.slice(1);
      else v = "+" + v;
    }
    return v;
  }

  function setError(msg) {
    errorEl.textContent = msg || "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("");

    const fullName = form.full_name.value.trim();
    const phoneRaw = form.phone.value.trim();
    const email = form.email.value.trim();
    const firm = form.firm.value.trim();
    const role = form.role.value.trim();
    const markets = form.markets.value.trim();
    const consent = form.consent.checked;

    if (!fullName || !phoneRaw || !consent) {
      setError("Name, mobile number, and consent are required.");
      return;
    }

    const phone = toE164(phoneRaw);
    if (phone.replace(/\D/g, "").length < 8) {
      setError("That doesn't look like a valid mobile number.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const status = source === "applicant" ? "pending" : "n/a";

    const { error } = await supabase.from("registrations").insert({
      full_name: fullName,
      phone,
      email: email || null,
      firm: firm || null,
      role: role || null,
      markets: markets || null,
      consent,
      source,
      status,
    });

    if (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = source === "applicant" ? "Apply" : "Join AgentWise";
      if (error.code === "23505") {
        setError("That mobile number is already registered.");
      } else {
        setError("Something went wrong, please try again.");
        console.error(error);
      }
      return;
    }

    formStateEl.classList.add("hidden");
    successEl.classList.add("on");
  });
}
