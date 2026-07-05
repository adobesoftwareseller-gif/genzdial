import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
    const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    return (
        <div className="card">
            {product.tag && <span className="tag" data-tag={product.tag}>{product.tag}</span>}
            <Link to={`/product/${product._id}`} className="img-wrap">
                <img src={product.image} alt={product.name} loading="lazy" />
            </Link>
            <div className="body">
                <Link to={`/product/${product._id}`} className="brand" title={product.brand || product.name}>{product.brand || product.name}</Link>
                <div className="model" title={product.brand ? product.name : (product.description || '')}>{product.brand ? product.name : (product.description || '')}</div>
                <div className="price-row">
                    <span className="price">₹ {Number(product.price).toLocaleString('en-IN')}</span>
                    {off > 0 && <span className="mrp">₹ {Number(product.mrp).toLocaleString('en-IN')}</span>}
                    {off > 0 && <span className="off">-{off}%</span>}
                </div>
            </div>
        </div>
    );
}
