"use client";

export default function UserTable() {
    return(

        

        <div className="pb-4 block m-6">

            <div className="pb-4 flex flex-row justify-between items-center">
                <h2 className="text-2xl font-bold px-4">All Users</h2>
                <button className="btn-primary">Add User</button>
            </div>

            <table className="usertable border rounded-lg">
                <thead className="usertablehead rounded-lg">
                    <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border hover:bg-gray-100">
                        <td className="flex items-center">
                            <div className="p-4 rounded-full border ml-2">
                                <p>SM</p>
                            </div>
                            <div className="p-4">
                                <strong>Sarah Mitchell</strong><br></br>
                                <small>SMitchell@trainingden.com</small>
                            </div>
                        </td>

                        <td>
                            <span className="border rounded-full p-4">Admin</span>
                        </td>

                        <td className="p-4">
                            <button><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg></button>
                            <button><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg></button>
                        </td>
                    </tr>

                    <tr className="border hover:bg-gray-100">
                        <td className="flex items-center">
                            <div className="p-4 rounded-full border ml-2">
                                <p>SM</p>
                            </div>

                            <div className="p-4">
                                <strong>Sarah Mitchell</strong><br></br>
                                <small>SMitchell@trainingden.com</small>
                            </div>
                        </td>

                        <td>
                            <span className="border rounded-full p-4">Admin</span>
                        </td>

                        <td className="p-4">
                            <button><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg></button>
                            <button><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
