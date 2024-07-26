import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Card, Container, Table, Row, Col } from 'react-bootstrap';
import CustomAlert from './CustomAlert'; 

const App = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [formType, setFormType] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // States for filtering and pagination
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/accounts');
        setAccounts(response.data);
        setAccountId(response.data.length > 0 ? response.data[0].id : '');
      } catch (error) {
        console.error('Error fetching accounts', error);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (accountId) {
      const fetchAccountData = async () => {
        try {
          const accountResponse = await axios.get(`http://localhost:5001/accounts/${accountId}`);
          setBalance(accountResponse.data.balance);
          setTransactions(accountResponse.data.transactions);
          setAccountHolder(accountResponse.data.accountHolder);
        } catch (error) {
          console.error('Error fetching account data', error);
        }
      };
      fetchAccountData();
    }
  }, [accountId]);

  const handleTransaction = async (type, amount, receiverId) => {
    if (amount <= 0) {
      setAlertMessage("Amount must be greater than zero.");
      setShowAlert(true);
      return;
    }
  
    if (type === 'withdrawal' && amount > balance) {
      setAlertMessage("Insufficient funds for withdrawal.");
      setShowAlert(true);
      return;
    }
  
    if (type === 'transfer') {
      if (!accounts.find(acc => acc.id === receiverId)) {
        setAlertMessage("Invalid receiver ID.");
        setShowAlert(true);
        return;
      }
      if (amount > balance) {
        setAlertMessage("Insufficient funds for transfer.");
        setShowAlert(true);
        return;
      }
    }
  
    let newBalance = balance;
    if (type === 'deposit') {
      newBalance += amount;
    } else if (type === 'withdrawal') {
      newBalance -= amount;
    } else if (type === 'transfer') {
      newBalance -= amount;
      try {
        const receiverResponse = await axios.get(`http://localhost:5001/accounts/${receiverId}`);
        const receiverBalance = receiverResponse.data.balance + amount;
        const receiverTransactions = [
          ...receiverResponse.data.transactions,
          {
            dateTime: new Date().toLocaleString(),
            amount: amount,
            balance: receiverBalance,
            receiverId: accountId,
            type: 'transfer'
          },
        ];
        await axios.patch(`http://localhost:5001/accounts/${receiverId}`, {
          balance: receiverBalance,
          transactions: receiverTransactions,
        });
      } catch (error) {
        console.error('Error transferring data', error);
        return;
      }
    }
  
    const transactionDateTime = new Date().toLocaleString();
    const newTransaction = {
      dateTime: transactionDateTime,
      amount: type === 'withdrawal' || type === 'transfer' ? -amount : amount,
      balance: newBalance,
      receiverId: type === 'transfer' ? receiverId : null,
      type
    };
  
    const updatedTransactions = [newTransaction, ...transactions];
  
    try {
      await axios.patch(`http://localhost:5001/accounts/${accountId}`, {
        balance: newBalance,
        transactions: updatedTransactions,
      });
      setBalance(newBalance);
      setTransactions(updatedTransactions);
      setAlertMessage('Transaction successful.');
      setShowAlert(true);
    } catch (error) {
      console.error('Error updating data', error);
    }
  };

  const handleAccountChange = (e) => {
    setAccountId(e.target.value);
  };

  const handleButtonClick = (type) => {
    setFormType(type);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    setAlertMessage('');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'filterType') setFilterType(value);
    if (name === 'startDate') setStartDate(value);
    if (name === 'endDate') setEndDate(value);
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      if (filterType && transaction.type !== filterType) return false;
      if (startDate && new Date(transaction.dateTime) < new Date(startDate)) return false;
      if (endDate && new Date(transaction.dateTime) > new Date(endDate)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return new Date(a.dateTime) - new Date(b.dateTime);
      return new Date(b.dateTime) - new Date(a.dateTime);
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  return (
    <Container className='mt-5'>
      <CustomAlert show={showAlert} handleClose={handleCloseAlert} message={alertMessage} />

      <Card>
        <Card.Body>
          <Card.Title style={{fontSize: '30px'}}>Account Overview</Card.Title>
          <Card.Text style={{fontSize: '25px'}}>Name: {accountHolder}</Card.Text>
          <Card.Text style={{fontSize: '25px'}}>Account ID: {accountId}</Card.Text>
          <Card.Text style={{fontSize: '25px'}}>Balance: ${balance.toFixed(2)}</Card.Text>
        </Card.Body>
      </Card>

      <Form.Group className="my-3">
        <Form.Label>Select Account</Form.Label>
        <Form.Control as="select" value={accountId} onChange={handleAccountChange}>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.accountHolder} ({account.id})
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <div className="mb-4">
        <Button onClick={() => handleButtonClick('deposit')} className="me-2" variant="primary">
          Deposit
        </Button>
        <Button onClick={() => handleButtonClick('withdrawal')} className="me-2" variant="warning">
          Withdraw
        </Button>
        <Button onClick={() => handleButtonClick('transfer')} className="me-2" variant="success">
          Transfer
        </Button>
        <Button onClick={() => handleButtonClick('statement')} variant="info">
          View Statement
        </Button>
      </div>

      {formType && formType !== 'statement' && (
        <Card className="mb-4 p-3">
          <Card.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const amount = parseFloat(e.target.amount.value);
                const receiverId = formType === 'transfer' ? e.target.receiverId.value : null;
                handleTransaction(formType, amount, receiverId);
                e.target.reset();
              }}
            >
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  step="0.01"
                  required
                />
              </Form.Group>
              {formType === 'transfer' && (
                <Form.Group className="mb-3">
                  <Form.Label>Receiver ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="receiverId"
                    required
                  />
                </Form.Group>
              )}
              <Button type="submit" variant="primary">
                Submit
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {formType === 'statement' && (
        <Card className="mb-4 p-3">
          <Card.Body>
            <Card.Title>Account Statement</Card.Title>

            {/* Filtering Options */}
            <Form className="mb-3">
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Filter by Type</Form.Label>
                    <Form.Control as="select" name="filterType" value={filterType} onChange={handleFilterChange}>
                      <option value="">All</option>
                      <option value="deposit">Deposit</option>
                      <option value="withdrawal">Withdrawal</option>
                      <option value="transfer">Transfer</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control type="date" name="startDate" value={startDate} onChange={handleFilterChange} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control type="date" name="endDate" value={endDate} onChange={handleFilterChange} />
                  </Form.Group>
                </Col>
              </Row>
            </Form>

            {/* Sort Order */}
            <Form.Group className="mb-3">
              <Form.Label>Sort by Date</Form.Label>
              <Form.Control as="select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Form.Control>
            </Form.Group>

            {/* Transactions Table */}
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Receiver ID</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.dateTime}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.balance.toFixed(2)}</td>
                    <td>{transaction.receiverId || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between">
              <Button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default App;
