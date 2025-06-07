# Callback, Promise, Async/Await

## 1. Callback Functions

Callback là hàm được truyền như tham số cho hàm khác và được gọi sau khi một tác vụ hoàn thành.

### Ví dụ cơ bản
```javascript
function greet(name, callback) {
    console.log('Xin chào ' + name);
    callback();
}

function sayGoodbye() {
    console.log('Tạm biệt!');
}

greet('An', sayGoodbye);
// Output:
// Xin chào An
// Tạm biệt!
```

### Callback với setTimeout
```javascript
function fetchData(callback) {
    console.log('Đang tải dữ liệu...');
    
    setTimeout(() => {
        const data = { id: 1, name: 'User 1' };
        callback(null, data); // null = no error
    }, 2000);
}

fetchData((error, data) => {
    if (error) {
        console.log('Lỗi:', error);
    } else {
        console.log('Dữ liệu:', data);
    }
});
```

### Vấn đề Callback Hell
```javascript
// Đây là vấn đề phổ biến với callbacks
getData((err, a) => {
    if (err) return handleError(err);
    
    getMoreData(a, (err, b) => {
        if (err) return handleError(err);
        
        getEvenMoreData(b, (err, c) => {
            if (err) return handleError(err);
            
            // Code trở nên khó đọc và maintain
            processData(c, (err, result) => {
                if (err) return handleError(err);
                console.log('Kết quả:', result);
            });
        });
    });
});
```

## 2. Promise

Promise là object đại diện cho việc hoàn thành (hoặc thất bại) của một tác vụ bất đồng bộ.

### Tạo Promise
```javascript
const myPromise = new Promise((resolve, reject) => {
    const success = Math.random() > 0.5;
    
    setTimeout(() => {
        if (success) {
            resolve('Thành công!');
        } else {
            reject(new Error('Thất bại!'));
        }
    }, 1000);
});
```

### Sử dụng Promise
```javascript
myPromise
    .then(result => {
        console.log('Kết quả:', result);
        return result.toUpperCase(); // Có thể chain
    })
    .then(upperResult => {
        console.log('Uppercase:', upperResult);
    })
    .catch(error => {
        console.log('Lỗi:', error.message);
    })
    .finally(() => {
        console.log('Hoàn thành (dù thành công hay thất bại)');
    });
```

### Promise.resolve() và Promise.reject()
```javascript
// Tạo promise đã resolved
const resolvedPromise = Promise.resolve('Giá trị ngay lập tức');

// Tạo promise đã rejected  
const rejectedPromise = Promise.reject(new Error('Lỗi ngay lập tức'));
```

### Promise.all() - Chờ tất cả
```javascript
const promise1 = fetch('/api/users');
const promise2 = fetch('/api/posts');
const promise3 = fetch('/api/comments');

Promise.all([promise1, promise2, promise3])
    .then(responses => {
        console.log('Tất cả request đã hoàn thành');
        // Xử lý tất cả responses
    })
    .catch(error => {
        console.log('Có ít nhất 1 request bị lỗi:', error);
    });
```

### Promise.race() - Lấy kết quả đầu tiên
```javascript
const slowPromise = new Promise(resolve => 
    setTimeout(() => resolve('Chậm'), 3000)
);

const fastPromise = new Promise(resolve => 
    setTimeout(() => resolve('Nhanh'), 1000)
);

Promise.race([slowPromise, fastPromise])
    .then(result => {
        console.log(result); // 'Nhanh'
    });
```

## 3. Async/Await

Async/await là cú pháp giúp viết code bất đồng bộ giống như code đồng bộ.

### Function Async
```javascript
async function fetchUserData() {
    try {
        console.log('Đang tải user...');
        
        const response = await fetch('/api/user/1');
        const user = await response.json();
        
        console.log('User:', user);
        return user;
        
    } catch (error) {
        console.log('Lỗi khi tải user:', error);
        throw error; // Re-throw để caller có thể handle
    }
}

// Sử dụng
fetchUserData()
    .then(user => console.log('Đã có user:', user))
    .catch(error => console.log('Lỗi cuối:', error));
```

### Async Arrow Function
```javascript
const getData = async () => {
    const data = await fetch('/api/data');
    return data.json();
};

// Hoặc với parameters
const updateUser = async (id, userData) => {
    const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
    return response.json();
};
```

### Xử lý song song với Async/Await
```javascript
async function loadAllData() {
    try {
        // Sequential - chờ từng cái
        const users = await fetch('/api/users');
        const posts = await fetch('/api/posts'); // Chờ users xong mới chạy
        
        // Parallel - chạy đồng thời
        const [usersResponse, postsResponse] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/posts')
        ]);
        
        const usersData = await usersResponse.json();
        const postsData = await postsResponse.json();
        
        return { users: usersData, posts: postsData };
        
    } catch (error) {
        console.log('Lỗi:', error);
    }
}
```

### Async với loops
```javascript
const userIds = [1, 2, 3, 4, 5];

// Sequential processing - từng cái một
async function processUsersSequential() {
    const results = [];
    
    for (const id of userIds) {
        const user = await fetchUser(id);
        results.push(user);
    }
    
    return results;
}

// Parallel processing - tất cả cùng lúc
async function processUsersParallel() {
    const promises = userIds.map(id => fetchUser(id));
    const results = await Promise.all(promises);
    return results;
}

// Controlled concurrency - giới hạn số lượng đồng thời
async function processUsersBatch() {
    const batchSize = 2;
    const results = [];
    
    for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const batchPromises = batch.map(id => fetchUser(id));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }
    
    return results;
}
```

## 4. So sánh các cách tiếp cận

### Cùng một tác vụ với 3 cách khác nhau

#### Với Callback
```javascript
function getUserWithCallback(id, callback) {
    setTimeout(() => {
        const user = { id, name: `User ${id}` };
        callback(null, user);
    }, 1000);
}

getUserWithCallback(1, (err, user) => {
    if (err) return console.log('Lỗi:', err);
    
    getUserWithCallback(user.friendId, (err, friend) => {
        if (err) return console.log('Lỗi:', err);
        
        console.log('User và friend:', user, friend);
    });
});
```

#### Với Promise
```javascript
function getUserWithPromise(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = { id, name: `User ${id}`, friendId: id + 1 };
            resolve(user);
        }, 1000);
    });
}

getUserWithPromise(1)
    .then(user => {
        return getUserWithPromise(user.friendId);
    })
    .then(friend => {
        console.log('User và friend:', user, friend); // Lỗi: user không tồn tại ở đây
    })
    .catch(console.error);
```

#### Với Async/Await
```javascript
async function getUserWithAsync(id) {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = { id, name: `User ${id}`, friendId: id + 1 };
            resolve(user);
        }, 1000);
    });
}

async function loadUserAndFriend() {
    try {
        const user = await getUserWithAsync(1);
        const friend = await getUserWithAsync(user.friendId);
        
        console.log('User và friend:', user, friend);
    } catch (error) {
        console.log('Lỗi:', error);
    }
}

loadUserAndFriend();
```

## 5. Best Practices

### Error Handling
```javascript
// Luôn handle errors
async function safeApiCall() {
    try {
        const data = await fetch('/api/data');
        return await data.json();
    } catch (error) {
        console.error('API call failed:', error);
        // Return default value hoặc throw custom error
        return { error: 'Failed to load data' };
    }
}

// Với Promise
fetch('/api/data')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error:', error);
        return { error: 'Failed to load data' };
    });
```

### Timeout
```javascript
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), ms);
    });
    
    return Promise.race([promise, timeout]);
}

// Sử dụng
const dataPromise = fetch('/api/slow-endpoint');
withTimeout(dataPromise, 5000)
    .then(data => console.log('Dữ liệu:', data))
    .catch(error => console.log('Lỗi hoặc timeout:', error));
```

## Bài tập thực hành

1. Tạo function với callback để simulate API call
2. Convert callback function thành Promise
3. Viết async function để gọi multiple APIs
4. Implement retry mechanism với async/await
