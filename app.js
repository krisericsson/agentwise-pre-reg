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

    const firstName = form.first_name.value.trim();
    const lastName = form.last_name.value.trim();
    const phoneRaw = form.phone.value.trim();
    const email = form.email.value.trim();
    const firm = form.firm.value.trim();
    const role = form.role.value;
    const primaryMarket = form.primary_market.value.trim();
    const workTypes = [...form.querySelectorAll('input[name="work_type"]:checked')].map(
      (cb) => cb.value
    );
    const consent = form.consent.checked;

    if (!firstName || !lastName || !phoneRaw || !email || !firm || !role || !primaryMarket || !workTypes.length || !consent) {
      setError("Please complete all required fields.");
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
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
      firm,
      role,
      primary_market: primaryMarket,
      work_type: workTypes.length ? workTypes : null,
      consent,
      source,
      status,
    });

    if (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = source === "applicant" ? "Apply" : "Register my place";
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
