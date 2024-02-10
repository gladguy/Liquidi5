const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;


const agentCreator = (canisterId, IDL) => {

    const CanisterAgent = new HttpAgent({
        host: process.env.HTTP_AGENT_ACTOR_HOST,
    })

    const API = Actor.createActor(IDL, {
        agent: CanisterAgent,
        canisterId: canisterId
    });

    return API;
}

module.exports = { agentCreator };