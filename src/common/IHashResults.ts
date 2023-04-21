export default interface IHashResults {
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