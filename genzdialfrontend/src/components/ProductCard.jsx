import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { toast } from 'react-toastify';

export default function ProductCard({ product }) {
    const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
        toast.success(`${product.name} added to cart`);
    };

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
                <button type="button" className="btn-cart" onClick={handleAddToCart}>
                    Add to Cart
                </button>
            </div>
        </div>
    );
}