import { useEffect, useState } from "react";

export default function Slideshow() {
  const [activeSlide, setActiveSlide] = useState(1);
  const slideCount = 3;
  const slideInterval = 3000;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide % slideCount) + 1);
    }, slideInterval);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className='carousel'>
      <div className='text-slider'>
        <div className='images-wrapper'>
          <img
            src='image1.png'
            className={`image img-1 ${activeSlide === 1 ? "show" : ""}`}
            alt='Slide 1'
          />
          <img
            src='image2.png'
            className={`image img-2 ${activeSlide === 2 ? "show" : ""}`}
            alt='Slide 2'
          />
          <img
            src='image3.png'
            className={`image img-3 ${activeSlide === 3 ? "show" : ""}`}
            alt='Slide 3'
          />
        </div>

        <div className='text-wrap'>
          <div
            className='text-group'
            style={{ transform: `translateY(${-(activeSlide - 1) * 2.2}rem)` }}
          >
            <h2>Плануйте свій день разом з нами</h2>
            <h2>Кастомізуйте списки як Вам зручно</h2>
            <h2>Ефективно менеджіть завдання в команді</h2>
          </div>
        </div>

        <div className='bullets'>
          {Array.from({ length: slideCount }, (_, index) => (
            <span
              key={index}
              className={activeSlide === index + 1 ? "active" : ""}
              data-value={index + 1}
              onClick={() => setActiveSlide(index + 1)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
}
