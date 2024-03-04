import React from 'react'
import { useHistory } from 'react-router-dom'
import { Pagination } from 'react-bootstrap'

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }) => {
  let history = useHistory()

  const linkHandler = page => {
    if (isAdmin) {
      return history.push(`/admin/products/${page}`)
    }

    if (keyword) {
      history.push(`/search/${keyword}/page/${page}`)
    } else {
      history.push(`/page/${page}`)
    }
  }

  return (
    pages > 1 && (
      <Pagination>
        {[...Array(pages).keys()].map(x => (
          <Pagination.Item
            key={x + 1}
            onClick={e => linkHandler(e.target.innerText)}
            active={x + 1 === page}
          >
            {x + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    )
  )
}

export default Paginate
