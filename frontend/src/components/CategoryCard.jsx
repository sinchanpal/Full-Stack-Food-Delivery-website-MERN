import React from 'react'

//TODO This component I have to Check later 
const CategoryCard = ({ name, image, onClick }) => {
  return (
    <div className='w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-2xl border-2 border-[#ff4d2d] shrink-0 overflow-hidden bg-white shadow-2xl shadow-gray-200 hover:shadow-lg transition-shadow relative cursor-pointer' onClick={onClick}>
      <img src={image} alt={name} className='w-full h-full object-cover transform hover:scale-110 transition-transform duration-300' />

      <div className='absolute bottom-0 w-full left-0 bg-white/70 px-3 py-1 rounded-t-xl text-center shadow text-sm font-medium text-gray-800 backdrop-blur-sm'>
        {name}
      </div>
    </div>
  )
}

export default CategoryCard
