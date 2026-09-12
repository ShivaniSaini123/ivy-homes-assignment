require("dotenv").config();

const { getListings } = require("./services/ivyService");

async function test() {
    const a = await getListings(1, 50);
    const b = await getListings(2, 50);

    console.log("PAGE 1:");
    console.log(a);

    console.log("PAGE 2:");
    console.log(b);
}

test();
