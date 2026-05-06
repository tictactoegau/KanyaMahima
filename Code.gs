/************************************************************
 * Kanya Mahima Website JavaScript
 * ----------------------------------------------------------
 * Contact form → Google Apps Script → Email + Google Sheet
 ************************************************************/

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxS9_JVD7UEk6ZP7jfBJcXWEPbYQtVL-sqmdjR6a8ptoS2fsa-1NliwYPoFgEULvu1t/exec";

document.addEventListener("DOMContentLoaded", function () {
  initContactForm();
});


function initContactForm() {
  const form = document.querySelector("#contactForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const statusMessage = document.querySelector("#formStatus");

    const name = form.querySelector("[name='name']")?.value.trim() || "";
    const email = form.querySelector("[name='email']")?.value.trim() || "";
    const message = form.querySelector("[name='message']")?.value.trim() || "";

    if (!name || !email || !message) {
      showStatus(statusMessage, "Please fill in all required fields.", "error");
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      showStatus(statusMessage, "Sending your message...", "info");

      const visitorInfo = await getVisitorInfo();

      const payload = {
        name: name,
        email: email,
        message: message,
        source: "Kanya Mahima website contact form",

        pageUrl: window.location.href,
        browser: visitorInfo.browser,
        deviceType: visitorInfo.deviceType,
        screenSize: visitorInfo.screenSize,
        language: visitorInfo.language,
        timezone: visitorInfo.timezone,
        ipAddress: visitorInfo.ipAddress
      };

      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      form.reset();

      showStatus(
        statusMessage,
        "Thank you. Your message has been submitted.",
        "success"
      );

    } catch (error) {
      console.error("Kanya Mahima contact form error:", error);

      showStatus(
        statusMessage,
        "Something went wrong. Please try again.",
        "error"
      );

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    }
  });
}


async function getVisitorInfo() {
  const userAgent = navigator.userAgent || "";

  let ipAddress = "Unavailable";

  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();

    if (ipData && ipData.ip) {
      ipAddress = ipData.ip;
    }
  } catch (error) {
    console.warn("IP lookup failed:", error);
  }

  return {
    browser: detectBrowser(userAgent),
    deviceType: detectDeviceType(userAgent),
    screenSize: window.screen.width + "x" + window.screen.height,
    language: navigator.language || "Unavailable",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unavailable",
    ipAddress: ipAddress
  };
}


function detectBrowser(userAgent) {
  if (userAgent.includes("Edg/")) {
    return "Microsoft Edge";
  }

  if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) {
    return "Google Chrome";
  }

  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    return "Safari";
  }

  if (userAgent.includes("Firefox/")) {
    return "Firefox";
  }

  if (userAgent.includes("OPR/") || userAgent.includes("Opera/")) {
    return "Opera";
  }

  return "Unknown Browser";
}


function detectDeviceType(userAgent) {
  const mobilePattern = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  if (mobilePattern.test(userAgent)) {
    return "Mobile or Tablet";
  }

  return "Desktop";
}


function showStatus(element, message, type) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = "form-status " + type;
}