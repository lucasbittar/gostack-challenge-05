import React, { Component } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import Pagination from '../../components/Pagination';
import { Loading, Owner, IssueList, Filter } from './styles';

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    per_page: 5,
    page: 1,
    loading: true,
    filtering: true,
    filters: [
      { label: 'All', value: 'all' },
      { label: 'Open', value: 'open' },
      { label: 'Closed', value: 'closed' },
    ],
    state: 'all',
  };

  async loadIssues() {
    const { match } = this.props;
    const { state, per_page, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        per_page,
        page,
      },
    });

    this.setState({
      issues: issues.data,
      loading: false,
      filtering: false,
    });
  }

  async componentDidMount() {
    const { match } = this.props;
    const { state, per_page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      filtering: false,
    });
  }

  componentDidUpdate(_, prevState) {
    const { state } = this.state;

    if (prevState.state !== state) {
      this.loadIssues();
    }
  }

  handleSelectChange = e => {
    this.setState({ state: e.target.value, filtering: true });
  };

  handlePagination = async action => {
    const { page } = this.state;
    await this.setState({
      page: action === 'prev' ? page - 1 : page + 1,
    });
    this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      state,
      filtering,
      filters,
      page,
    } = this.state;

    if (loading) {
      return <Loading>Loading...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Go Back</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          Filter issues by state:
          <select value={state} onChange={this.handleSelectChange}>
            {filters.map(f => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Filter>
        <IssueList>
          {filtering ? (
            <div>Filtering issues...</div>
          ) : (
            <>
              {issues.map(issue => (
                <li key={String(issue.id)}>
                  <img src={issue.user.avatar_url} alt={issue.user.login} />
                  <div>
                    <strong>
                      <a href={issue.html_url}>{issue.title}</a>
                      {issue.labels.map(label => (
                        <span key={String(label.id)}>{label.name}</span>
                      ))}
                    </strong>
                    <p>{issue.user.login}</p>
                  </div>
                </li>
              ))}
            </>
          )}
        </IssueList>
        <Pagination>
          <button
            disabled={page === 1}
            onClick={() => this.handlePagination('prev')}
          >
            <FaChevronLeft size={14} color="#fff" />
          </button>
          <button onClick={() => this.handlePagination('next')}>
            <FaChevronRight size={14} color="#fff" />
          </button>
        </Pagination>
      </Container>
    );
  }
}

export default Repository;
