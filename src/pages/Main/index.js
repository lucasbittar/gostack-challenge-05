import React, { Component } from 'react';
import { FaGitter, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import Container from '../../components/Container';
import InputError from '../../components/InputError';
import { Form, SubmitButton, List } from './styles';

class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: null,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value, error: null });
  };

  handleSubmit = async e => {
    e.preventDefault();

    try {
      this.setState({ loading: true });

      const { newRepo, repositories } = this.state;

      const duplicatedRepo = repositories.filter(r => r.name === newRepo);

      if (duplicatedRepo.length !== 0) {
        throw new Error('Repository already added. Try a different one.');
      }

      const response = await api.get(`/repos/${newRepo}`).catch(err => {
        const notFound = err.response.status === 404;
        if (notFound) {
          throw new Error('Repository not found. Maybe a typo?');
        } else {
          throw new Error(err.response.data.message);
        }
      });

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        error: null,
      });
    } catch (err) {
      // Stop loading and update error message
      this.setState({
        loading: false,
        error: err.message,
      });
    }
  };

  render() {
    const { newRepo, loading, repositories, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGitter />
          Repositories
        </h1>
        <Form onSubmit={this.handleSubmit}>
          <input
            value={newRepo}
            onChange={this.handleInputChange}
            className={error ? 'input-error' : undefined}
            type="text"
            placeholder="Add repo"
          />
          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>
        {error && <InputError>{error}</InputError>}

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Details
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}

export default Main;
