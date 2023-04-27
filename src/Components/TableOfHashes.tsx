import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {TableVirtuoso, TableComponents} from 'react-virtuoso';
import {forwardRef} from "react";

export interface HashData {
    content: string,
    hash: string
}

interface ColumnData {
    width: number,
    dataKey: keyof HashData;
    label: string;
}

const headerColumns: ColumnData[] = [
    {
        width: 50,
        label: "Content",
        dataKey: "content",
    },
    {
        width: 50,
        label: "Hash",
        dataKey: "hash",
    },
]


const VirtuosoTableComponents: TableComponents<HashData> = {
    Scroller: forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer component={Paper} {...props} ref={ref}/>
    )),
    Table: (props) => (
        <Table {...props} sx={{borderCollapse: 'separate', tableLayout: 'fixed'}}/>
    ),
    TableHead,
    TableRow: ({item: _item, ...props}) => <TableRow {...props} />,
    TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref}/>
    )),
};

function fixedHeaderContent() {
    return (
        <TableRow>
            {headerColumns.map((column) => (
                <TableCell
                    key={column.dataKey}
                    variant="head"
                    align={'left'}
                    style={{width: column.width + "%"}}
                    sx={{
                        backgroundColor: 'background.paper',
                    }}
                >
                    {column.label}
                </TableCell>
            ))}
        </TableRow>
    );
}

function rowContent(_index: number, row: HashData) {
    return <>
        {headerColumns.map((column) => (
            <TableCell
                key={column.dataKey}
                align={"left"}
            >
                {row[column.dataKey]}
            </TableCell>
        ))}
    </>
}

interface TableOfHashesProps {
    dataToDisplay: Array<HashData>
}

function TableOfHashes(props: TableOfHashesProps) {
    return (
        <Paper style={{height: 300, width: "100%"}}>
            <TableVirtuoso
                data={props.dataToDisplay}
                components={VirtuosoTableComponents}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={rowContent}
            />
        </Paper>
    );
}

export default TableOfHashes;