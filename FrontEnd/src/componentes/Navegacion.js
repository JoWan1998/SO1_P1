import React, { Component } from 'react'
import {Link} from 'react-router-dom'
export default class Navegacion extends Component {
    render() {
        return (
            
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
            <Link className = "navbar-brand" to="/">
                Sistema Distribuido
            </Link>
            
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon">#</span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
               
                <ul className="navbar-nav ml-auto">

                    <li className="nav-item">
                       <Link className="nav-link" to="/repo">
                            System Monitor
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/funel">
                            Mensajeria
                        </Link>
                    </li>
                </ul>
                </div>
            </div>
            </nav>             
        )
    }
}
