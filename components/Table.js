export default function Table({ columns = [], data = [] }) {
  return (
	<div className='bg-white rounded shadow'>
	  <div className='hidden md:block overflow-x-auto'>
	    <table className='min-w-full divide-y divide-gray-200'>
		  <thead className='bg-gray-50'>
		    <tr>
			  {columns.map(c => (
			    <th
				  key={c.key}
				  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'
				>
				  {c.title}
				</th>
			  ))}
		    </tr>
		  </thead>
		  <tbody className='bg-white divide-y divide-gray-200'>
		    {data.map(r => (
			  <tr key={r._id}>
			    {columns.map(c => (
				  <td key={c.key} className='px-6 py-4 text-sm text-gray-700'>
				    {c.render ? c.render(r) : r[c.key] || '—'}
				  </td>
			    ))}
			  </tr>
		    ))}
		  </tbody>
	    </table>
	  </div>
	  <div className='md:hidden divide-y'>
	    {data.map(r => (
		  <div key={r._id} className='p-4'>
		    <div className='space-y-2'>
			  {columns.map(c => (
			    <div key={c.key} className='flex justify-between gap-4'>
				  <span className='text-xs uppercase text-gray-500'>{c.title}</span>
				  <span className='text-sm text-gray-800'>
				    {c.render ? c.render(r) : r[c.key] || '—'}
				  </span>
			    </div>
			  ))}
		    </div>
		  </div>
	    ))}
	  </div>
	</div>
  );
}
