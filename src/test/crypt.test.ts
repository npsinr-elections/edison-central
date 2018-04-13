import * as crypt from "../server/utils/crypt";

import {expect} from "chai";
import "mocha";

describe("crypt module", () => {
    it("keylen", async () => {
        const encryptKey = await crypt.genEncryptKey();
        expect(encryptKey).to.have.lengthOf(32);
    });

});
