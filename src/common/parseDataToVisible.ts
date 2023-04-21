import IHashResults from "./IHashResults";
import {DataToRender} from "../Components/TableOfHashes";

export default function parseDataToVisible(input: IHashResults[]): DataToRender[] {
    const output: DataToRender[] = []
    for (let i = 0; i < input.length; i++) {
        let entry = input[i];

        output.push({
            resId: entry.resId,
            error: entry.hasError,
            hashType: entry.results.hashTypes,
            size: entry.size,
            result: "Click me!",
        });
    }
    return output;
}