import React, { Component } from 'react'
import TableRow1 from './TableRow1';

class Table1 extends Component{
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

    removeRows = () =>
    {
        this.state.rows = [];
    }

    getHeader = () => {
        this.keys = this.props.data;
        return this.keys .map((key, index)=>{
        return <th key={key}>{key.toUpperCase()}</th>
        })
    }

    agregar_datos = (array) => {
        if(array.length > 0)
        {
            this.setState({rows: []})
            for(var aux of array)
            {
                if(aux.name != null && aux.name != ''
                    && aux.age != null && aux.age != ''
                    && aux.infectedtype != null && aux.infectedtype != ''
                    && aux.location != null && aux.location != ''
                    && aux.state != null && aux.state != '')
                {
                    var temp = {
                        Paciente: aux.name,
                        Edad: aux.age,
                        Ubicacion: aux.location,
                        Tipo: aux.infectedtype,
                        Estado: aux.state
                    };
                    this.addRow(temp);
                }
            }

        }
	}

    render() {
        return (
            <div>
                <table className="table table-bordered">
                <thead><tr className="table-primary">{this.getHeader()}</tr></thead>
                    <tbody>
                        {
                            this.state.rows.map((row, index) => { return <TableRow1 key={index} row={row} keys={this.keys} rowindex = {index + 1}></TableRow1>} )
                        }

                    </tbody>
                </table>
            </div>
        )
    }
}

export default Table1;
