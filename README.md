# Experiment Notes

**Agent:** Cursor Agent, Auto

**Prompt:** I would like to create a bitcoin tip jar for a small local improv group. Please build it like the one in this repo here, accept modify the text for the improv group. @https://github.com/sbddesign/btc-tip-jar 

**Context:** None

It one-shotted the interface. It cloned the btc-tip-jar repo, then scanned all the files inside to understand it better. I think it then duplicated all of this into the improv-tip-jar directory, then modified key details like the recipient's name, slogan, and the tip amounts+descriptions.

The app succesfully ran in local dev. I pasted in the Voltage env vars as the agent instructed me to do, but the lightning functionality was broken. After inquiring as to why it might be broken, it was able to figure out after my 2nd prompt that the problem was rooted in the backend API route being built with Netlify and needing to be run in a certain way. After some fenagling, it got this fixed and the app succesfully generated BOLT11 invoices!

It's cool that it was able to produce something working and functional. However, I feel that it basically just copied what was already there. I'm not sure if it would have been so succesful if I had given it a lot of other specific stuff to change or features to build.

---