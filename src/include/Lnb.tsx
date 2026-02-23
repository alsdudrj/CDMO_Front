import {Sidebar,Brand,BrandText,Divider,SidebarCard } from "../styled/Component.styles";

const Lnb = () => {
    return (
    <>
        {/* Sidebar */}
        <Sidebar
        className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
        id="accordionSidebar"
        >
        {/* Sidebar - Brand */}
        <Brand
            className="sidebar-brand d-flex align-items-center justify-content-center"
            href="/admin"
        >
            <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink" />
            </div>

            <BrandText className="sidebar-brand-text mx-3 mt-5">
            &nbsp;MES<sup>sea2</sup>
            </BrandText>
        </Brand>

        {/* Divider */}
        <Divider className="sidebar-divider my-0" />

        {/* Nav Item - Dashboard */}
        <li className="nav-item active">
            <a className="nav-link" href="/admin">
            <i className="fas fa-fw fa-tachometer-alt" />
            <span>MES Dashboard</span>
            </a>
        </li>

        {/* Nav Item - Batch Management */}
        <li className="nav-item">
            <a className="nav-link" href="#">
            <i className="fas fa-fw fa-industry" />
            <span>Batch Management</span>
            </a>
        </li>

        {/* Nav Item - Deviations */}
        <li className="nav-item">
            <a className="nav-link d-flex justify-content-between align-items-center" href="#">
            <div>
                <i className="fas fa-fw fa-exclamation-triangle" />
                <span>Deviations</span>
            </div>
            <span className="badge badge-danger">3</span>
            </a>
        </li>

        {/* Nav Item - e-Signatures */}
        <li className="nav-item">
            <a className="nav-link" href="#">
            <i className="fas fa-fw fa-file-signature" />
            <span>e-Signatures</span>
            </a>
        </li>

        {/* Nav Item - Material Inventory */}
        <li className="nav-item">
            <a className="nav-link" href="#">
            <i className="fas fa-fw fa-boxes" />
            <span>Material Inventory</span>
            </a>
        </li>

        {/* Nav Item - Reports & Analytics */}
        <li className="nav-item">
            <a className="nav-link" href="#">
            <i className="fas fa-fw fa-chart-bar" />
            <span>Reports & Analytics</span>
            </a>
        </li>

        <Divider className="sidebar-divider d-none d-md-block" />

        {/* Sidebar Toggler */}
        <div className="text-center d-none d-md-inline">
            <button className="rounded-circle border-0" id="sidebarToggle" />
        </div>

        {/* Sidebar Message */}
        <SidebarCard className="sidebar-card d-none d-lg-flex">
            <img
            className="sidebar-card-illustration mb-2"
            src="img/undraw_rocket.svg"
            alt="..."
            />
            <p className="text-center mb-2">
            <strong></strong>
            Is Next
            </p>
            <a className="btn btn-success btn-sm" href="#">
            MES
            </a>
        </SidebarCard>
        </Sidebar>
        {/* End of Sidebar */}
        </>
    );
}
export default Lnb;
