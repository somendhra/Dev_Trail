package com.example.aiinsurance.service;

import com.example.aiinsurance.model.Query;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.QueryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QueryService {

    @Autowired
    private QueryRepository queryRepository;

    public Query create(User user, String question) {
        Query q = new Query(user, question);
        q.setFromAdmin(false);
        return queryRepository.save(q);
    }

    public Query createFromAdmin(User user, String answer, String replyToMessage) {
        Query q = new Query();
        q.setUser(user);
        q.setQuestion(""); // Or "Response from Support"
        q.setAnswer(answer);
        q.setFromAdmin(true);
        q.setReplyToMessage(replyToMessage);
        q.setAnsweredAt(java.time.LocalDateTime.now());
        return queryRepository.save(q);
    }

    public List<Query> getForUser(User user) {
        return queryRepository.findByUserOrderByCreatedAtAsc(user);
    }

    public List<Query> getAll() {
        return queryRepository.findAll();
    }

    public Optional<Query> findById(Long id) {
        return queryRepository.findById(id);
    }

    public void clearForUser(User user) {
        List<Query> queries = getForUser(user);
        for (Query q : queries) {
            q.setClearedByUser(true);
            if (q.isClearedByUser() && q.isClearedByAdmin()) {
                queryRepository.delete(q);
            } else {
                queryRepository.save(q);
            }
        }
    }

    public void clearForAdmin(User user) {
        List<Query> queries = getForUser(user);
        for (Query q : queries) {
            q.setClearedByAdmin(true);
            if (q.isClearedByUser() && q.isClearedByAdmin()) {
                queryRepository.delete(q);
            } else {
                queryRepository.save(q);
            }
        }
    }
    
    public void markAsReadForUser(User user) {
        List<Query> queries = getForUser(user);
        for (Query q : queries) {
            if (!q.isReadByUser()) {
                q.setReadByUser(true);
                queryRepository.save(q);
            }
        }
    }

    public Query save(Query q) {
        return queryRepository.save(q);
    }
}