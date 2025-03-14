"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trans } from 'react-i18next';
// import { getDoc, updateDoc, doc } from "firebase/firestore";
// import db from '../../../firebase-config';
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
  PaginationTotalStandalone,
  SizePerPageDropdownStandalone
} from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import useInterval, { BASE_URL, ROUTES } from '@/utils/common';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import useCountry from '@/hooks/useCountry';
import useUser from '@/hooks/useUser';
import { toast } from "react-toastify";


export function Users() {
    const [ users, setUsers ] = useState([]);
    const [ permissions, setPermissions ] = useState(0);
    const [ spinner, setSpinner ] = useState(true);
    const { country } = useCountry();
    const { user } = useUser();
    const authToken = localStorage.getItem('Auth Token');
    const [ totalUsers, setTotalUsers ] = useState(0);
    console.log("totalUser 31",totalUsers)
    const [ currentPage, setCurrentPage ] = useState({page: 1, sizePerPage: 10});
    const { page, sizePerPage } = currentPage;
    const [ sort, setSort ] = useState({field: '', order: ''});
    const { field, order } = sort;
    const [ search, setSearch ] = useState('');
    

    const fetchUsers = async () => {
        const response = await fetch(`${BASE_URL}/users?page=${page}&size=${sizePerPage}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`, 
                "x-api-key": "Ohana-Agent-oo73",       
              },
            body: JSON.stringify({search, field, order}),
        });
        const jsonData = await response.json();
        if (jsonData.success) {
            setSpinner(false);
            setUsers(jsonData.users.data);
            setTotalUsers(jsonData.users.total);
        }
        if (user || !user?.role_id) {
            setPermissions({add: true, view: true, edit: true, delete: true});
        } else {
            var rolePermission = user.role.permissions.filter((permission) => permission.section === 'Users');
            if (rolePermission.length && rolePermission[0].status) {
                setPermissions(...rolePermission);
            }
        }
    }

    useEffect(() => {
        if (!authToken) return;
        fetchUsers();
    }, [authToken, totalUsers, country, page, sizePerPage, search, field, order]);

    useInterval(fetchUsers, 20000, 5);

    const statusChange = async(check, row) => {
        // Update User Status.
        if (permissions.edit) {
            const response = await fetch(`${BASE_URL}/user-status-change`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`, 
                    "x-api-key": "Ohana-Agent-oo73",       
                  },
                body: JSON.stringify({id: row.id, check}),
            });

            const jsonData = await response.json();
            if (jsonData.success === true) {
                toast.success(jsonData.message);
              }
            if (jsonData.success) {
                fetchUsers();
            }
        }
    };

    const columns = [
        {
          dataField: 'first_name',
          text: 'User Name',
          sort: true,
          formatter: (cell, row) => row.first_name + " " + row.last_name
        },
        {
          dataField: 'phone',
          text: 'User Phone',
          sort: true,
        },
        {
          dataField: 'role.name',
          text: 'User Role',
        //   sort: true,
        },
        {
          dataField: 'countries',
          text: 'Country',
        //   sort: true,
          formatter: (cell, row) => cell.map((country) => country.nicename).join(', ')
        },


        // formatter: (cell, row) => {
        //     return permissions && permissions.edit ? (
        //       <BootstrapSwitchButton
        //         checked={cell === 0}
        //         onChange={(check) => {
        //           console.log("check  344", check);
        //           statusChange(check ? 0 : 1, row);
        //         }}
        //         onlabel="On"
        //         offlabel="Off"
        //         size="sm" 
        //         onstyle="secondary"
        //       />
        //     ) : (
        //       <span
        //         className={`py-1 px-2 rounded ${
        //           cell === 1 ? "alert-warning" : "alert-success"
        //         }`}
        //       >
        //         {cell === 1 ? "Inactive" : "Active"}
        //   </span>
        //     );
        //   },

        {
            dataField: 'account_rejected',
            text: 'Status',
            sort: true,
            formatter: (cell, row) => {
                return ! row.role_id ? "" : permissions && permissions.edit ? 
                    <BootstrapSwitchButton checked={cell === 0}
                        onChange={(check) => {
                            statusChange(check ? 0 : 1, row, row)
                        }}
                    onlabel='On' offlabel='Off' size="sm" onstyle="secondary" />
                :
                    <span className={ `py-1 px-2 rounded ${cell === 1  ? 'alert-warning' : 'alert-success'}` }>{ cell === 1  ? "Inactive" : "Active" }</span>
            }
        },
        {
            dataField: 'view',
            text: 'View',
            formatter: (cell, row) => {
                const html = <div className="icon-holder bg-secondary text-center p-2 rounded"><i className='mdi mdi-eye'></i></div>;
                return ! row.role ? "" : permissions && permissions.view ?
                    <Link className="nav-link" href={ ROUTES.customer + "/" + row.id }>{ html }</Link>
                : html
            }
        },
        {
            dataField: 'edit',
            text: 'Edit',
            formatter: (cell, row) => {
                const html = <div className="icon-holder bg-secondary text-center p-2 rounded"><i className='mdi mdi-square-edit-outline'></i></div>;
                return ! row.role ? "" : permissions && permissions.edit ?
                    <Link className="nav-link" href={ ROUTES.users + "/" + row.id + "/edit-user" }>{ html }</Link>
                : html
            }
        },
    ];

    const selectRow = {
        mode: 'checkbox',
        clickToSelect: false,
        bgColor: '#f3f3f3'
    }

    const { SearchBar } = Search;

    const handleTableChange = (type, newState) => {
        if (type === 'pagination') {
            setCurrentPage({ page: newState.page, sizePerPage: newState.sizePerPage });
        } else if (type === 'search') {
            setSearch(newState.searchText);
        } else if (type === 'sort') {
            setSort({field: newState.sortField, order: newState.sortOrder});
        }
    };

    return (
        <>
            {
                permissions && ! spinner ?
                    <PaginationProvider
                        pagination={paginationFactory({
                            custom: true,
                            totalSize: totalUsers,
                            page: page,
                            sizePerPage: sizePerPage,
                            paginationComponent: PaginationListStandalone
                        })}
                        keyField="id"
                        columns={columns}
                        data={users}
                    >
                        {
                            ({
                                paginationProps,
                                paginationTableProps
                            }) => (
                                <ToolkitProvider
                                    keyField="id"
                                    columns={ columns }
                                    data={ users }
                                    search={{
                                        searchFormatted: true
                                    }}
                                >
                                    {
                                        toolkitprops => (
                                            <>
                                                <div className='row'>
                                                    <div className='col-lg-12 d-flex justify-content-between my-2'>
                                                        <div className='col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin pl-0 pr-3'>
                                                            <SearchBar { ...toolkitprops.searchProps } style={{ border: 'none', width: '100%' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='row mb-2'>
                                                    <div className="col-lg-12 grid-margin-xl-0 grid-margin stretch-card">
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <div className="icon-holder alert-warning text-dark py-1 px-2 rounded mr-2">
                                                                        <svg width="17" height="15" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M0.011218 8.9119C0.145867 8.62016 0.325402 8.38452 0.673246 8.32842C1.16696 8.26109 1.54847 8.62016 1.57091 9.14753C1.64945 11.2234 2.58077 12.8055 4.36488 13.8603C5.15033 14.3203 6.01433 14.5559 6.92321 14.5559C9.41422 14.5672 11.9164 14.5672 14.4075 14.5672C14.4523 14.5672 14.4972 14.5559 14.5758 14.5559C14.5758 14.455 14.5758 14.354 14.5758 14.2642C14.5758 13.2656 14.5758 12.2669 14.5758 11.2683C14.5758 10.6848 14.9909 10.3145 15.5183 10.4379C15.6978 10.4828 15.8662 10.6062 16.0008 10.7297C17.74 12.3791 19.468 14.0398 21.2072 15.6892C21.3194 15.8014 21.4429 15.9137 21.5551 16.0259C21.9703 16.4298 21.9703 16.8786 21.5551 17.2826C20.3432 18.4383 19.1314 19.5941 17.9196 20.7498C17.2575 21.3782 16.6067 22.0065 15.9447 22.6349C15.5408 23.0164 15.0022 22.994 14.7216 22.5676C14.6207 22.3993 14.5758 22.1748 14.5758 21.9729C14.5645 20.9967 14.5645 20.0205 14.5645 19.0442C14.5645 18.9545 14.5645 18.8647 14.5645 18.7413C14.4411 18.7413 14.3401 18.7413 14.2391 18.7413C12.0287 18.7301 9.81817 18.7749 7.60768 18.7076C5.38596 18.6291 3.53454 17.6865 2.0534 16.0483C0.89766 14.7691 0.224415 13.2543 0.0448824 11.5263C0.0336616 11.4702 0.0112208 11.4141 0 11.358C0.0112208 10.5389 0.011218 9.73101 0.011218 8.9119Z" fill="black" />
                                                                            <path d="M10.4235 8.34185C10.4235 8.44284 10.4235 8.5326 10.4235 8.63359C10.4235 9.63224 10.4235 10.6309 10.4235 11.6295C10.4235 12.213 10.0196 12.5833 9.49218 12.4599C9.32387 12.4262 9.15556 12.3028 9.02091 12.1906C7.6632 10.9114 6.3167 9.60979 4.95899 8.31941C4.45406 7.83691 3.94912 7.35442 3.44419 6.87193C3.02902 6.4792 3.02902 6.01915 3.44419 5.62642C5.30684 3.84232 7.16948 2.06944 9.03213 0.28534C9.30143 0.0272625 9.60439 -0.0849452 9.96345 0.0721455C10.3113 0.229236 10.4347 0.509755 10.4347 0.88004C10.4347 1.86747 10.4347 2.84367 10.4347 3.8311C10.4347 3.93209 10.4347 4.02185 10.4347 4.16772C10.5582 4.16772 10.6591 4.16772 10.7601 4.16772C12.9594 4.17894 15.1699 4.13406 17.3692 4.20139C19.6245 4.26871 21.5096 5.2337 22.9908 6.91681C24.3485 8.45406 25.0105 10.2718 24.9993 12.3364C24.9993 12.8077 24.9993 13.279 24.9993 13.7503C24.9993 14.2327 24.6739 14.5694 24.225 14.5694C23.7762 14.5694 23.4508 14.244 23.4396 13.7615C23.3723 11.1246 21.6555 9.01509 19.0859 8.45406C18.7269 8.37551 18.3566 8.34185 17.9975 8.33063C15.5402 8.31941 13.0828 8.33063 10.6367 8.33063C10.5694 8.33063 10.5133 8.34185 10.4235 8.34185Z" fill="black" />
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="font-weight-semibold mb-0 text-warning">Users</h6>
                                                                    </div>
                                                                    {
                                                                        permissions && permissions.add ?
                                                                            <div className='col-xl-3 col-lg-6 col-sm-6 grid-margin-xl-0 grid-margin pl-3 pr-0 ml-auto text-right'>
                                                                                <Button variant="primary">
                                                                                    <Link className="text-white text-decoration-none" href={ ROUTES.add_new_user }>
                                                                                        <Trans>Add New User</Trans>
                                                                                    </Link>
                                                                                </Button>
                                                                            </div>
                                                                        : ""
                                                                    }
                                                                </div>
                                                                <div className="table-responsive">
                                                                    <BootstrapTable
                                                                        // striped
                                                                        hover
                                                                        selectRow={ selectRow }
                                                                        noDataIndication={ 'No results found' }
                                                                        bordered={ false }
                                                                        { ...toolkitprops.baseProps }
                                                                        { ...paginationTableProps }
                                                                        remote={{ search: true, pagination: true }}
                                                                        onTableChange={handleTableChange}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='row'>
                                                    <div className="flex items-center justify-between w-full px-3">
                                                        <div className='col pl-0'>
                                                            <SizePerPageDropdownStandalone
                                                                { ...paginationProps }
                                                            />
                                                            <PaginationTotalStandalone
                                                                { ...paginationProps }
                                                            />
                                                        </div>
                                                        <div className='col pr-0'>
                                                            <PaginationListStandalone
                                                                { ...paginationProps }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }
                                </ToolkitProvider>
                            )
                        }
                    </PaginationProvider>
                :
                    spinner ?
                        <Spinner animation="grow" style={{ left: '55%', bottom: '50%', position: 'fixed' }} />
                    :
                        <>
                            <h1 className="text-center mt-5 pt-5">Permission Denied!</h1>
                            <p className="text-center mt-3">Sorry!, You don't have permission to access this module.</p>
                        </>
            }
        </>
    );
}
export default Users;