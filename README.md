# revCAPTCHA

There seems to be a surprising lack of products designed to ensure the security of robot-only services. Doesn't anyone want to make sure those pesky humans don't start creating spam accounts on their shiny brand-new site? **revCAPTCHA** solves this issue by being (assuredly) the first CAPTCHA service with challenges designed NOT to let humans in, while being realistically accomplished by our fellow robots.

This *shouldn't* have to be said, but **THIS IS NOT A LEGITIMATE CAPTCHA SERVICE** and should not be used as such!

Running the revCAPTCHA server can be done with `npm start`. It requires a running Redis server!


## Process

- Server or client (doesn't matter for this phase, although client is suggested to avoid ratelimits accrued from one single request server) requests a `challenge` using the **`/new-challenge`** endpoint. This endpoint returns the information related to the challenge itself, as well as a `challengeKey`.
- User produces an `answer` for the challenge, and the server or client sends the `challengeKey` paired with the `answer` to the **`/verify`** endpoint.
- `/verify` endpoint returns whether the answer was correct, and if it was, provides a `successKey`. Whether or not the answer was correct, the `challengeKey` and related answer are removed from the revCAPTCHA server, and cannot be used again.

**NOTE:** At this point, if the previous steps were handled by the client, it must now send the `successKey` to a server (not the revCAPTCHA server) of some sort to be confirmed. This cannot be done on the client, or it would be easily defeatable.

- The server sends the client-provided `successKey` to the revCAPTCHA server to be verified. If the `successKey` does actually exist (indicating a challenge was successful), it returns a `success` of `true`. The server can now continue whatever process it is conducting that involves anti-human verification. If a `successKey` does exist, it is removed from the revCAPTCHA server and cannot be used again.