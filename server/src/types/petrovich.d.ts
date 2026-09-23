declare module "petrovich" {
  interface PetrovichPerson {
    gender: "male" | "female";
    first: string;
    middle: string;
    last: string;
  }

  interface PetrovichResult {
    first: string;
    middle: string;
    last: string;
  }

  function petrovich(person: PetrovichPerson, gcase: string): PetrovichResult;

  export default petrovich;
}