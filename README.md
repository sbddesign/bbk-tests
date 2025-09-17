# Experiment Notes

**Agent:** Cursor Agent, Auto

**Prompt:** I would like to create a bitcoin tip jar for a local improve group. Please create the tip jar by following the instructions in this guide, only change the text and messaging to be relevant to an improv group. @https://bitcoin-builder-kit-docs.netlify.app/guides/bitcoin-tip-jar/getting-started/ 

**Context:** @https://bitcoin-builder-kit-docs.netlify.app/guides/bitcoin-tip-jar/getting-started/

It came out surprisingy good! The interface looks a little janky because it added an input for custom amount that does not work. It completely left out the netlfiy voltage stuff, so the there is no lightning invoice, but it does show the qr component.

## Updates

Kept prompting it to actually add Netlify and Voltage support. Eventually it got the Netlify CLI stuff running, but completely fumbled with Voltage. Giving up now that the context window is at over 80% full and we are the point where it's trying to make a mock API.