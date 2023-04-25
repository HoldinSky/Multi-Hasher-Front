export default interface IHashResult {
    resId: number,
    hasError: boolean,
    size: number,
    results: {
        pathToContent: string,
        hashTypes: string,
        hashes: object,
        error: string | null
    }
}

export const EMPTY_RESULT: IHashResult = {
    resId: 0,
    hasError: true,
    size: 0,
    results: {
        pathToContent: "",
        hashTypes: "",
        hashes: {},
        error: "Empty Result!",
    }
}