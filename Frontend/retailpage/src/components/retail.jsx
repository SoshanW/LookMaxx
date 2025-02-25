import '../index.css'

 const Retailpage = () => {

  return (
    <>
      <div className="hero-content">
          <h1 className="hero-title">
            FIND <span className="highlight">YOUR</span> FIT
          </h1>
          <p className="hero-subtitle">Shop Smart, Style Confidently</p>
          <p className="hero-tagline">
            <span className="try-it">- Try it,</span>{' '}
            <span className="buy-it">Buy it</span>
          </p>
          <button className="shop-button">
            Shop Now
          </button>
        </div>
        <div className="hero-image right">
          <img
            src="/api/placeholder/400/600"
            alt="Female model in purple suit"
          />
        </div>

    </>
  )
}

export default Retailpage