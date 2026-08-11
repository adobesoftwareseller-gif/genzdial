export default function Loader({ label = 'Loading…' }) {
    return (
        <div className="admin-loader">
            <div className="admin-spinner" aria-hidden="true" />
            <span className="admin-loader-label">{label}</span>
        </div>
    );
}
