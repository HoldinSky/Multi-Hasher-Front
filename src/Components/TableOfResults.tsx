import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import IHashResult from "../common/IHashResult";
import {Button} from "@mui/material";
import {Link} from "react-router-dom";

interface DataToRender {
    resId: number,
    error: boolean,
    hashType: string,
    size: number,
    result: string,
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof DataToRender;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: "resId",
        numeric: true,
        disablePadding: false,
        label: "Result ID",
    },
    {
        id: "error",
        numeric: false,
        disablePadding: false,
        label: "Error",
    },
    {
        id: "hashType",
        numeric: false,
        disablePadding: false,
        label: "Types of hash",
    },
    {
        id: "size",
        numeric: true,
        disablePadding: false,
        label: "Size (MB)",
    },
    {
        id: "result",
        numeric: true,
        disablePadding: false,
        label: "More info",
    },
];

const DEFAULT_ROWS_PER_PAGE = 10;

function ResultsTableHead() {
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.id === "size" || headCell.id === "result" ? "right" : "left"}
                        padding="normal"
                    >
                        {headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

interface TableToolbarProps {
    clearHistoryHandler: () => void;
}

function TableToolbar(props: TableToolbarProps) {
    return (
        <Toolbar
            sx={{
                pl: {sm: 2},
                pr: {xs: 1, sm: 1},
            }}
        >
            <Typography
                sx={{flex: "1 1 100%"}}
                variant="h6"
                id="tableTitle"
                component="div"
            >
                Hash Procedures
            </Typography>
            <Button color="error" variant="contained" onClick={props.clearHistoryHandler}
                    sx={{
                        width: "200px",
                        my: "0.5rem",
                        alignSelf: "right",
                    }}
            >Clear History</Button>
        </Toolbar>
    );
}

interface TableOfResultsProps {
    finishedTasks: IHashResult[];
    clearHistoryHandler: () => void;
}

function TableOfResults(props: TableOfResultsProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
    const [paddingHeight, setPaddingHeight] = useState(0);

    const results = props.finishedTasks;
    const dataToRenderRef = useRef<DataToRender[]>([]);

    useEffect(() => {
        dataToRenderRef.current = parseDataToVisible(results);
        const numEmptyRows =
            page > 0 ? Math.max(0, (1 + page) * rowsPerPage - dataToRenderRef.current.length) : rowsPerPage - dataToRenderRef.current.length;

        setPaddingHeight(33 * numEmptyRows);
    }, [page, results, results.length, rowsPerPage]);

    const handleChangePage = useCallback(
        (event: unknown, newPage: number) => {
            setPage(newPage);

            const numEmptyRows =
                newPage > 0 ? Math.max(0, (1 + newPage) * rowsPerPage - dataToRenderRef.current.length) : rowsPerPage - dataToRenderRef.current.length;

            const newPaddingHeight = 33 * numEmptyRows;
            setPaddingHeight(newPaddingHeight);
        },
        [rowsPerPage],
    );

    const handleChangeRowsPerPage = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const updatedRowsPerPage = parseInt(event.target.value, 10);
            setRowsPerPage(updatedRowsPerPage);

            setPage(0);
            setPaddingHeight(0);
        },
        [],
    );

    return (
        <Box sx={{width: '100%'}}>
            <Paper sx={{width: '100%', mb: 2}}>
                <TableToolbar clearHistoryHandler={props.clearHistoryHandler}/>
                <TableContainer>
                    <Table
                        sx={{minWidth: 750}}
                        aria-labelledby="tableTitle"
                        size={'small'}
                    >
                        <ResultsTableHead/>
                        <TableBody>
                            {dataToRenderRef.current
                                ? dataToRenderRef.current.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((value, index) => {
                                    return (
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            key={value.resId}
                                        >
                                            <TableCell component="th" scope="row" padding="normal" align="left">
                                                {value.resId}
                                            </TableCell>
                                            <TableCell align="left">{value.error ? "Yes" : "No"}</TableCell>
                                            <TableCell align="left">{value.hashType}</TableCell>
                                            <TableCell align="right">{value.size}</TableCell>
                                            <TableCell align="right"><Link to={"/details"}
                                                                           state={{hashResult: results[index],}}>{value.result}</Link></TableCell>
                                        </TableRow>
                                    );
                                })
                                : null}
                            {paddingHeight > 0 && (
                                <TableRow
                                    style={{
                                        height: paddingHeight,
                                    }}
                                >
                                    <TableCell colSpan={6}/>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={dataToRenderRef.current.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}

export default TableOfResults;

function parseDataToVisible(input: IHashResult[]): DataToRender[] {
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