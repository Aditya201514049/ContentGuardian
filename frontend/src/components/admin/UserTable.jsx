import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

const UserTable = ({ users, onRoleUpdate, onDelete, onView }) => {
  const { currentUser } = useAuth();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user._id === currentUser?.id ? (
                  <div className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-md">
                    {user.role}
                    <p className="text-xs text-gray-500 mt-1">Cannot modify own role</p>
                  </div>
                ) : (
                  <select
                    value={user.role}
                    onChange={(e) => onRoleUpdate(user._id, e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="reader">Reader</option>
                    <option value="author">Author</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-4">
                <button
                  onClick={() => onView(user._id)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </button>
                {user._id !== currentUser?.id && (
                  <button
                    onClick={() => onDelete(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired
    })
  ).isRequired,
  onRoleUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func
};

export default UserTable;
