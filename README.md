# CRM Customization Bootcamp
## The Repo
This repo goes along with the **6-week HubSpot Academy Bootcamp**.
You will start using it during weeks 2 - 6. You will need to **fork** this repo.

## Bootcamp
If you found this repo and you're interested in signing up for the bootcamp, you can find more details here.

[Click here](https://www.hubspot.com/academy/bootcamps/crmcb) to learn more about the HubSpot Academy CRM Customization Bootcamp for Developers.

## Help
Join and subscribe to the [HubSpot Developer Community](https://community.hubspot.com/c/develop-build-integrate/58) if you haven't already!
It's the best place to connect and work with other HubSpot developers.

## Where to start
1. **Import the data.** Follow [`data/README.md`](data/README.md) to create the custom objects, properties, and sample records in your developer test account.
2. **Week 2: design before you build.** Work through [`week-2/README.md`](week-2/README.md): write a problem brief, mock the card with fake data, and turn the approved mockup into a build plan.
3. **Reference cards.** Use the projects in [`cards/`](cards/README.md) as working examples of a card wired up to serverless functions.

## File Structure
| Path | What it is |
| --- | --- |
| [`data/`](data) | All the data you need to import into your developer test account (custom object schemas, properties, and sample CSVs). |
| [`scripts/`](scripts) | `import_hubspot_custom_objects.py` imports everything in `data/` through the API. Set `HUBSPOT_API_TOKEN` first. An alternative to the Postman steps. |
| [`cards/`](cards/README.md) | A simple and an advanced RentalCars card to show you how to get started. Built on platform version **2026.09**. |
| [`week-2/`](week-2/README.md) | Understand the problem before you build: problem brief, Claude Code prompts, build plan, a fully mocked Vehicle Recommendation card (recommendation, booking panel, and Loaded / Loading / Error / Empty states), and a one-shot card to compare against. |
| [`CRM-CARD-FRONTEND-STANDARDS.md`](CRM-CARD-FRONTEND-STANDARDS.md) | Rules, patterns, and gotchas for building cards that look and behave like native HubSpot. |
| [`.claude/skills/hubspot-card-design`](.claude/skills/hubspot-card-design/SKILL.md) | A Claude Code skill with the design rules for cards that look and feel like HubSpot (uses [hs-uix](https://github.com/05bmckay/hs-uix)). Claude Code picks it up automatically when you open this repo. |

## Requirements
- [HubSpot CLI](https://github.com/HubSpot/hubspot-cli/) v8.16.0 or newer (`npm install -g @hubspot/cli@latest`)
- Node.js 20 or newer
- A HubSpot developer test account (serverless functions won't upload to non-Enterprise standard accounts)
- Your favorite editor, VS Code, Zed.dev, Notepad++
- Optional: [Claude Code](https://claude.com/claude-code) or another AI coding agent, with the HubSpot Developer MCP (`hs mcp setup`, run inside your project folder)

## Credits
<table>
<tr>
<td><h3>Carter McKay</h3>
<p><a target="_blank" rel="noopener" href="https://www.linkedin.com/in/carterwm/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" height="30" alt="LinkedIn Badge"/></a></ul>
</td>
<td><h3>Justin Givens</h3>
<p><a target="_blank" rel="noopener" href="https://www.linkedin.com/in/justindgivens/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" height="30" alt="LinkedIn Badge"/></a></p>
</td>
<td><a><a target="_blank" rel="noopener" href="https://github.com/hubspotdev/">Developer Advocates</a></h3>
<p></p>
</td>
</tr>
</table>

## Other useful links
- [Developer HUG](https://events.hubspot.com/developer/)
- [HubSpot Developer YouTube](https://www.youtube.com/@HubSpotDevelopers)
