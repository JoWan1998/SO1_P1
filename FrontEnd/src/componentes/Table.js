import React, { Component } from 'react'
import TableRow from './TableRow';

class Table extends Component{
    constructor(props) {
        super(props);
        this.state = {
            rows: [],
        }
        this.keys = [];
        this.getHeader = this.getHeader.bind(this);
        this.addRow = this.addRow.bind(this)
        this.removeRow = this.removeRow.bind(this)
    }

   addRow(data){
        var {rows} = this.state
        rows.push(data);
        this.setState({rows: rows})
    }

    removeRow = (index) => {
        var {rows} = this.state;
        while(rows.length > 0){
            rows.splice(index, 1);
        }

        this.setState({rows})
    }

    getHeader = () => {
        var keys = this.props.data;
        this.keys = keys;
        return keys.map((key, index)=>{
        return <th key={key}>{key.toUpperCase()}</th>
        })
    }

    agregar_datos = (array) => {
        if(array.length > 0)
        {
            console.log("ingreso");
            for(var aux of array)
                this.addRow(aux);
        }
	}

    render() {
        return (
            <div>
                <table className="table table-hover">
                <thead><tr className="table-primary">{this.getHeader()}</tr></thead>
                    <tbody>
                        {
                            this.state.rows.map((row, index) => { return <TableRow key={index} row={row} keys={this.keys} rowindex = {index + 1}></TableRow>} )
                        }

                    </tbody>
                </table>
            </div>
        )
    }
}

export default Table
