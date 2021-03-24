import React, { Component } from 'react'

class TableRow extends Component{
    constructor(props) {
        super(props);
        this.state = {
            rowindex : props.rowindex ,
        }

        this.getRowsData = this.getRowsData.bind(this);
        this.removeRow = this.removeRow.bind(this)
    }  

    removeRow(){
        this.props.handleRemove(this.state.index)
    }

    getRowsData = function(){
        var items = [this.props.row];
        var keys = this.props.keys;
        return items.map((row, index)=>{
        return <RenderRow key={index} data={row} keys={keys}/>
        })
    }

    render() {
        return (
            <tr>
                {this.getRowsData()}
            </tr>
        )
    }
}

const RenderRow = (props) =>{
    return props.keys.map((key, index)=>{
    return <td key={props.data[key]}>{props.data[key]}</td>
    })
}
export default TableRow;