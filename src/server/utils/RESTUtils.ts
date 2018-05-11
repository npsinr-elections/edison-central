import { checks, StringValidator } from "../../shared/StringValidator";
import * as database from "./database";

import { Data, ERRORS, JSONResponse } from "./JSONResponse";

import { Response } from "express";
import shortid = require("shortid");

type Resource = database.Election | database.Office | database.Candidate;

const electionInterface: database.Election = {
  id: "",
  name: "",
  description: "",
  image: "",
  color: "",
  offices: []
};

const officeInterface: database.Office = {
  id: "",
  name: "",
  description: "",
  image: "",
  color: "",
  candidates: []
};

const candidateInterface: database.Candidate = {
  id: "",
  name: "",
  image: "",
  votes: 0
};

/**
 * Convert an election/office/candidate object to a JSONAPI data object
 * @param  {string} resourceType Either election/office/candidate
 * @param  {Resource} resource The `resourceType` object
 * @returns Data
 */
function dataFromResource(resourceType: string, resource: Resource): Data {
  switch (resourceType) {
    case "election":
      return dataFromElection(resource as database.Election);
    case "office":
      return dataFromOffice(resource as database.Office);
    case "candidate":
      return dataFromCandidate(resource as database.Candidate);
  }
  return undefined;
}

/**
 * Generates JSONAPI data from an `election` object
 * @param  {database.Election} election
 * @returns Data
 */
function dataFromElection(election: database.Election): Data {
  const { offices, id, ...rest } = election;
  return {
    type: "election",
    id: id,
    attributes: rest,
    relationships: {
      offices: {
        links: {
          self: "/data/offices"
        }
      }
    }
  };
}

/**
 * Generates JSONAPI data from an `office` object
 * @param  {database.Office} office
 * @returns Data
 */
function dataFromOffice(office: database.Office): Data {
  const { candidates, id, ...rest } = office;
  return {
    type: "office",
    id: id,
    attributes: rest,
    relationships: {
      candidates: {
        links: {
          self: "/data/candidates/" + id
        }
      }
    }
  };
}

/**
 * Generates JSONAPI data from an `candidate` object
 * @param  {database.Candidate} candidate
 * @returns Data
 */
function dataFromCandidate(candidate: database.Candidate): Data {
  const { id, ...rest } = candidate;
  return {
    type: "candidate",
    id: id,
    attributes: rest
  };
}

/**
 * Finds an office object by `id`
 * @param  {string} id The ID to search for
 * @param  {database.Election} electionData election object to search in
 * @returns database.Office
 */
export function getOfficeById(
  id: string,
  electionData: database.Election): database.Office {
  for (const office of electionData.offices) {
    if (office.id === id) {
      return office;
    }
  }
  return undefined;
}

/**
 * Finds a candidate object by `candidateID` in office with ID `officeID`
 * @param  {string} candidateID
 * @param  {string} officeID
 * @param  {database.Election} electionData
 * @returns database.Candidate
 */
export function getCandidateById(
  candidateID: string,
  officeID: string,
  electionData: database.Election): database.Candidate {
  const office = getOfficeById(officeID, electionData);
  for (const candidate of office.candidates) {
    if (candidate.id === candidateID) {
      return candidate;
    }
  }
}

/**
 *  Checks if `data` has a type field of `type`
 * @param  {Data} data
 * @param  {string} type
 * @returns
 */
export function isResourceType(data: Data, type: string): boolean {
  return data.type === type;
}

/**
 * Handles a JSON API patch request with `data` in body into `resource`. Returns
 * a success/error response to user with the help of `res`.
 * @param  {Response} res
 * @param  {Data} data
 * @param  {Resource} resource
 */
export function patchResource(res: Response, data: Data, resource: Resource) {
  // First check if ONLY valid attributes of a resource are being patched
  const disallowedAttributes = ["offices", "candidates", "votes", "id"];
  for (const attr in data.attributes) {
    if (attr in resource && !(attr in disallowedAttributes)) {
      // If attribute name is valid, then validate its value
      const validator = new StringValidator(data.attributes[attr],
        checks[attr]);
      if (!validator.valid) {
        return JSONResponse.Error(res,
          ERRORS.dataErrors.invalidValue(validator.getField(), attr));
      }
    } else {
      return JSONResponse.Error(res,
        ERRORS.dataErrors.invalidAttribute(data.type, attr));
    }
  }

  // If reached here then all patched attributes are valid!
  for (const attr of Object.keys(data.attributes)) {
    resource[attr] = data.attributes[attr];
  }

  return JSONResponse.ResourceCreated(res,
    dataFromResource(data.type, resource));
}

/**
 * Handles a JSON api request to create a new resource
 * @param  {Response} res
 * @param  {Data} data
 */
export function newResource(res: Response, data: Data) {
  // First determine the type of resource
  let resourceInterface: Resource;
  switch (data.type) {
    case "election":
      resourceInterface = electionInterface;
      break;
    case "office":
      resourceInterface = officeInterface;
      break;
    case "candidate":
      resourceInterface = candidateInterface;
      break;
    default: // This case should be handled by something else before
      return false;
  }

  // Ensure that data attributes have all attributes of resource
  // trying to be created. Currently, extra invalid attributes are
  // ignored.
  const disallowedAttributes = ["offices", "candidates", "votes", "id"];
  for (const attr in resourceInterface) {
    if (attr in disallowedAttributes) {
      continue;
    }
    if (attr in data.attributes) {
      const validator = new StringValidator(data.attributes[attr],
        checks[attr]);
      if (!validator.valid) {
        return JSONResponse.Error(res,
          ERRORS.dataErrors.invalidValue(validator.getField(), attr));
      }
    } else {
      return JSONResponse.Error(res,
        ERRORS.dataErrors.missingAttribute(data.type, attr));
    }
  }

  // If reached here, then resource creation is VALID
  const newObj = Object.assign({}, resourceInterface);
  for (const attr of Object.keys(newObj)) {
    // Arrays have to be cloned, or things will get messy with
    // multiple new objects
    if (Array.isArray(newObj[attr])) {
      newObj[attr] = [];
    } else if (!(attr in disallowedAttributes)) {
      newObj[attr] = data.attributes[attr];
    }
  }
  newObj.id = shortid.generate();

  return JSONResponse.ResourceCreated(res,
    dataFromResource(data.type, newObj));
}
